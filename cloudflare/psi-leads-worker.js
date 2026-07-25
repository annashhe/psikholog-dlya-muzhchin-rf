/**
 * Cloudflare Worker: заявки с сайта → Telegram.
 * Settings → Variables: BOT_TOKEN (encrypt), CHAT_ID = 382337050
 */
const PSY_TZ = 'Europe/Kaliningrad';
const SITE_HOME = 'https://психолог-для-мужчин.рф';

function corsOriginForRequest(origin) {
  const allowed = new Set([
    'https://психолог-для-мужчин.рф',
    'https://xn-----glcflhfsdlncbk4a6bya1c4j.xn--p1ai',
    'https://annashhe.github.io',
  ]);
  if (origin && allowed.has(origin)) return origin;
  if (origin && origin.startsWith('https://annashhe.github.io')) return origin;
  return null;
}

const THERAPY = {
  individual: { title: 'Индивидуальная', label: 'Индивидуальная' },
  family: { title: 'Семейная (парная)', label: 'Семейная' },
};

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

/** +7XXXXXXXXXX без пробелов и скобок */
function normalizePhone(phone) {
  const raw = String(phone ?? '').trim();
  if (!raw) return '—';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return dash(raw);
  return `+${digits}`;
}

function phoneLineHtml(phone) {
  const p = normalizePhone(phone);
  if (p === '—') return 'Телефон: —';
  return `Телефон: <a href="tel:${escHtml(p)}">${escHtml(p)}</a>`;
}

/** В сообщении — только origin, без ?utm_… (UTM отдельными строками) */
function displayPageUrl(url) {
  const s = String(url ?? '').trim();
  if (!s) return SITE_HOME;
  try {
    const u = new URL(s);
    const host = u.hostname.toLowerCase();
    if (
      host === 'xn-----glcflhfsdlncbk4a6bya1c4j.xn--p1ai' ||
      host === 'психолог-для-мужчин.рф' ||
      host.endsWith('annashhe.github.io')
    ) {
      return SITE_HOME;
    }
    return u.origin;
  } catch {
    return SITE_HOME;
  }
}

function formatSessionDate(startIso, tz) {
  try {
    return new Date(startIso).toLocaleDateString('ru-RU', {
      timeZone: tz || 'Europe/Moscow',
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
    const zone = tz || 'Europe/Moscow';
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
  const methods = Array.isArray(data.contactMethods)
    ? data.contactMethods.map((m) => String(m).slice(0, 40)).filter(Boolean)
    : [];
  return [
    'Заявка с формы (обратный звонок)',
    '',
    `Имя: ${escHtml(dash(data.name))}`,
    phoneLineHtml(data.phone),
    `Способ связи: ${escHtml(methods.length ? methods.join(', ') : '—')}`,
    metaBlock(data),
  ].join('\n');
}

function buildBookingMessage(data) {
  const t = THERAPY[data.therapyType] || THERAPY.individual;
  const clientTz = data.clientTimezone || 'Europe/Moscow';
  const note = data.comment ? String(data.comment).trim().slice(0, 500) : '';
  const lines = [
    'Запись Онлайн через календарь',
    '',
    `Имя: ${escHtml(dash(data.name))}`,
    phoneLineHtml(data.phone),
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
      return Response.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    try {
      const body = await request.json();

      if (body.website) {
        return Response.json({ ok: true }, { headers: corsHeaders });
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
        if (!body.name || !body.phone || !body.startIso) {
          return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
        }
        text = buildBookingMessage({ ...body, ...meta });
      } else {
        if (!body.name || !body.phone) {
          return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
        }
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
        console.error(await tgRes.text());
        return Response.json({ error: 'Telegram error' }, { status: 502, headers: corsHeaders });
      }

      return Response.json({ ok: true }, { headers: corsHeaders });
    } catch (e) {
      console.error(e);
      return Response.json({ error: 'Server error' }, { status: 500, headers: corsHeaders });
    }
  },
};
