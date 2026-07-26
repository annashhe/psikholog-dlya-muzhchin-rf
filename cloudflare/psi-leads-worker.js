/**
 * Cloudflare Worker: заявки с сайта → Telegram.
 * Secrets/vars в Dashboard: BOT_TOKEN, CHAT_ID
 */
const PSY_TZ = 'Europe/Kaliningrad';
const SITE_HOME = 'https://психолог-для-мужчин.рф';
const RATE_LIMIT_WINDOW_SEC = 60;
const RATE_LIMIT_MAX = 8;
const NAME_MAX = 80;
const PHONE_DIGITS_MIN = 11;
const PHONE_DIGITS_MAX = 15;

function corsOriginForRequest(origin) {
  const allowed = new Set([
    'https://психолог-для-мужчин.рф',
    'https://xn-----glcflhfsdlncbk4a6bya1c4j.xn--p1ai',
  ]);
  if (origin && allowed.has(origin)) return origin;
  return null;
}

const THERAPY = {
  individual: { title: 'Индивидуальная', label: 'Индивидуальная 50 мин' },
  individual90: { title: 'Индивидуальная 90 мин', label: 'Индивидуальная 90 мин' },
  individual_90: { title: 'Индивидуальная 90 мин', label: 'Индивидуальная 90 мин' },
  family: { title: 'Семейная (парная)', label: 'Семейная 90 мин' },
};

const CONTACT_LABELS = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  max: 'MAX',
  sms: 'SMS',
  Telegram: 'Telegram',
  WhatsApp: 'WhatsApp',
  MAX: 'MAX',
  SMS: 'SMS',
};

function formatContactMethods(methods) {
  const list = Array.isArray(methods) ? methods : [];
  const labels = list
    .map((m) => {
      const raw = String(m ?? '').trim();
      if (!raw) return '';
      const key = raw.toLowerCase();
      return CONTACT_LABELS[raw] || CONTACT_LABELS[key] || raw.slice(0, 40);
    })
    .filter(Boolean);
  return labels.length ? labels.join(', ') : '—';
}

function dash(val) {
  const s = String(val ?? '').trim();
  return s || '—';
}

function escHtml(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizePhone(phone) {
  const raw = String(phone ?? '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return `+${digits}`;
}

function isValidPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  return digits.length >= PHONE_DIGITS_MIN && digits.length <= PHONE_DIGITS_MAX;
}

function isValidName(name) {
  const s = String(name ?? '').trim();
  return s.length >= 2 && s.length <= NAME_MAX;
}

function phoneLineHtml(phone) {
  const p = normalizePhone(phone);
  if (!p) return 'Телефон: —';
  return `Телефон: <a href="tel:${escHtml(p)}">${escHtml(p)}</a>`;
}

function displayPageUrl(url) {
  const s = String(url ?? '').trim();
  if (!s) return SITE_HOME;
  try {
    const u = new URL(s);
    const host = u.hostname.toLowerCase();
    if (
      host === 'xn-----glcflhfsdlncbk4a6bya1c4j.xn--p1ai' ||
      host === 'психолог-для-мужчин.рф'
    ) {
      return `${SITE_HOME.replace(/\/$/, '')}${u.pathname || '/'}`;
    }
    return u.origin + (u.pathname || '/');
  } catch {
    return SITE_HOME;
  }
}

function formatSessionDate(startIso, tz) {
  try {
    return new Date(startIso).toLocaleDateString('ru-RU', {
      timeZone: tz || PSY_TZ,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dash(startIso);
  }
}

function formatSlotRange(startIso, endIso, tz) {
  if (!startIso) return '—';
  try {
    const zone = tz || PSY_TZ;
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : null;
    const t0 = start.toLocaleTimeString('ru-RU', { timeZone: zone, hour: '2-digit', minute: '2-digit' });
    if (!end) return `${t0} ${zone}`;
    const t1 = end.toLocaleTimeString('ru-RU', { timeZone: zone, hour: '2-digit', minute: '2-digit' });
    return `${t0}-${t1} ${zone}`;
  } catch {
    return '—';
  }
}

function metaBlock(meta) {
  return [
    '',
    'Дополнительная информация:',
    `Страница заявки: ${escHtml(displayPageUrl(meta.pageUrl))}`,
    `UTM source: ${escHtml(dash(meta.utmSource))}`,
    `UTM medium: ${escHtml(dash(meta.utmMedium))}`,
    `UTM campaign: ${escHtml(dash(meta.utmCampaign))}`,
    `UTM content: ${escHtml(dash(meta.utmContent))}`,
    `UTM term: ${escHtml(dash(meta.utmTerm))}`,
  ].join('\n');
}

function buildCallbackMessage(data) {
  return [
    'Заявка с формы (обратный звонок)',
    '',
    `Имя: ${escHtml(dash(data.name))}`,
    phoneLineHtml(data.phone),
    `Способ связи: ${escHtml(formatContactMethods(data.contactMethods))}`,
    metaBlock(data),
  ].join('\n');
}

function resolveTherapy(data) {
  let type = data.therapyType;
  if (type === 'individual_90') type = 'individual90';
  if (THERAPY[type]) return THERAPY[type];
  if (data.startIso && data.endIso) {
    const mins = Math.round((new Date(data.endIso) - new Date(data.startIso)) / 60000);
    if (mins >= 80) return THERAPY.individual90;
  }
  return THERAPY.individual;
}

function buildBookingMessage(data) {
  const t = resolveTherapy(data);
  const clientTz = data.clientTimezone || PSY_TZ;
  const note = data.comment ? String(data.comment).trim().slice(0, 500) : '';
  const lines = [
    'Запись Онлайн через календарь',
    '',
    `Имя: ${escHtml(dash(data.name))}`,
    phoneLineHtml(data.phone),
    `Способ связи: ${escHtml(formatContactMethods(data.contactMethods))}`,
    `Формат: ${escHtml(t.label)}`,
    `Дата сессии: ${escHtml(formatSessionDate(data.startIso, clientTz))}`,
    `Часовой пояс психолога: ${escHtml(formatSlotRange(data.startIso, data.endIso, PSY_TZ))}`,
    `Часовой пояс клиента: ${escHtml(formatSlotRange(data.startIso, data.endIso, clientTz))}`,
  ];
  if (note) {
    lines.push('', `Комментарий клиента: ${escHtml(note)}`);
  }
  lines.push(metaBlock(data));
  return lines.join('\n');
}

async function checkRateLimit(request) {
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';
  const key = new Request(`https://psi-leads.rate/${encodeURIComponent(ip)}`);
  const cache = caches.default;
  const hit = await cache.match(key);
  let count = 0;
  if (hit) {
    count = parseInt(await hit.text(), 10) || 0;
  }
  if (count >= RATE_LIMIT_MAX) return false;
  await cache.put(
    key,
    new Response(String(count + 1), {
      headers: { 'Cache-Control': `max-age=${RATE_LIMIT_WINDOW_SEC}` },
    })
  );
  return true;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = corsOriginForRequest(origin);

    const corsHeaders = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (corsOrigin) {
      corsHeaders['Access-Control-Allow-Origin'] = corsOrigin;
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!corsOrigin) {
      return Response.json({ error: 'Forbidden origin' }, { status: 403, headers: corsHeaders });
    }

    if (!(await checkRateLimit(request))) {
      return Response.json({ error: 'Too many requests' }, { status: 429, headers: corsHeaders });
    }

    try {
      const body = await request.json();

      if (body.website) {
        return Response.json({ ok: true }, { headers: corsHeaders });
      }

      if (!isValidName(body.name) || !isValidPhone(body.phone)) {
        return Response.json({ error: 'Invalid fields' }, { status: 400, headers: corsHeaders });
      }

      const meta = {
        pageUrl: body.pageUrl,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        utmContent: body.utmContent,
        utmTerm: body.utmTerm,
      };

      let text;

      if (body.source === 'booking') {
        if (!body.startIso) {
          return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
        }
        text = buildBookingMessage({ ...body, ...meta });
      } else {
        text = buildCallbackMessage({ ...body, ...meta });
      }

      const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      if (!tgRes.ok) {
        console.error('Telegram status', tgRes.status);
        return Response.json({ error: 'Telegram error' }, { status: 502, headers: corsHeaders });
      }

      return Response.json({ ok: true }, { headers: corsHeaders });
    } catch (e) {
      console.error('Worker error', e && e.message ? e.message : 'unknown');
      return Response.json({ error: 'Server error' }, { status: 500, headers: corsHeaders });
    }
  },
};
