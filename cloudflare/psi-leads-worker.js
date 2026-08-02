/**
 * Cloudflare Worker: заявки с сайтов → Postgres (anna-backend) + Telegram.
 * Secrets/vars в Dashboard / wrangler:
 *   BOT_TOKEN, CHAT_ID (обязательно)
 *   LEADS_INGEST_SECRET (тот же, что LEADS_INGEST_SECRET на VPS backend)
 *   BACKEND_LEADS_URL (опционально; default https://anna-backend.ru/public/leads)
 * Optional: TURNSTILE_SECRET_KEY (если задан — нужен body.turnstileToken)
 *
 * Deploy: cd cloudflare && npx wrangler deploy
 * Secret: npx wrangler secret put LEADS_INGEST_SECRET
 */
const PSY_TZ = 'Europe/Kaliningrad';
const SITE_MALE_HOME = 'https://психолог-для-мужчин.рф';
const SITE_FAMILY_HOME = 'https://психолог-семейный-онлайн.рф';
const SITE_TEST_HOME = 'https://muzhskoy-psikholog.ru';
const RATE_LIMIT_WINDOW_SEC = 60;
const RATE_LIMIT_MAX = 8;
const IDEMPOTENCY_TTL_SEC = 600;
const IDEMPOTENCY_KEY_MAX = 64;
const NAME_MAX = 80;
const PHONE_DIGITS_MIN = 11;
const PHONE_DIGITS_MAX = 15;

const ALLOWED_ORIGINS = [
  SITE_MALE_HOME,
  'https://xn-----glcflhfsdlncbk4a6bya1c4j.xn--p1ai',
  SITE_FAMILY_HOME,
  'https://xn-----8kcjlarmacnhiqcdcbjg6bg0gwh.xn--p1ai',
  SITE_TEST_HOME,
  'http://muzhskoy-psikholog.ru',
];

const MALE_HOSTS = new Set([
  'психолог-для-мужчин.рф',
  'xn-----glcflhfsdlncbk4a6bya1c4j.xn--p1ai',
]);

const FAMILY_HOSTS = new Set([
  'психолог-семейный-онлайн.рф',
  'xn-----8kcjlarmacnhiqcdcbjg6bg0gwh.xn--p1ai',
]);

const TEST_HOSTS = new Set(['muzhskoy-psikholog.ru']);

function corsOriginForRequest(origin) {
  if (origin && ALLOWED_ORIGINS.includes(origin)) return origin;
  return null;
}

function allowedSitePrefixes() {
  return ALLOWED_ORIGINS.slice();
}

function corsOriginFromReferer(referer) {
  const ref = String(referer ?? '').trim();
  if (!ref) return null;
  const ok = allowedSitePrefixes().some((prefix) => ref.startsWith(prefix));
  if (!ok) return null;
  try {
    return corsOriginForRequest(new URL(ref).origin);
  } catch {
    return null;
  }
}

function resolveCorsOrigin(request) {
  const origin = request.headers.get('Origin') || '';
  const fromOrigin = corsOriginForRequest(origin);
  if (fromOrigin) return fromOrigin;
  if (!origin) {
    return corsOriginFromReferer(request.headers.get('Referer') || '');
  }
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

function phoneLinePlain(phone) {
  const p = normalizePhone(phone);
  return `Телефон: ${escHtml(p || '—')}`;
}

function isKaliningradPage(...urls) {
  for (const value of urls) {
    const s = String(value ?? '').trim();
    if (!s) continue;
    try {
      if (/\/kaliningrad(\/|$)/i.test(new URL(s).pathname)) return true;
    } catch {
      if (/\/kaliningrad(\/|$)/i.test(s)) return true;
    }
  }
  return false;
}

function familyCallbackTitle(pageUrl, referer) {
  if (isKaliningradPage(pageUrl, referer)) {
    return '<b>СЕМЕЙНЫЙ</b> · Заявка с формы (очно / Калининград)';
  }
  return '<b>СЕМЕЙНЫЙ</b> · Заявка с формы';
}

function siteFromHost(host) {
  const h = String(host ?? '').toLowerCase();
  if (MALE_HOSTS.has(h)) return { tag: 'МУЖСКОЙ', home: SITE_MALE_HOME };
  if (FAMILY_HOSTS.has(h)) return { tag: 'СЕМЕЙНЫЙ', home: SITE_FAMILY_HOME };
  if (TEST_HOSTS.has(h)) return { tag: 'TEST', home: SITE_TEST_HOME };
  return null;
}

function siteFromUrlLike(value) {
  const s = String(value ?? '').trim();
  if (!s) return null;
  try {
    return siteFromHost(new URL(s).hostname);
  } catch {
    return null;
  }
}

function detectSiteContext({ pageUrl, origin, referer }) {
  return (
    siteFromUrlLike(pageUrl) ||
    siteFromUrlLike(origin) ||
    siteFromUrlLike(referer) || { tag: 'ЗАЯВКА', home: SITE_MALE_HOME }
  );
}

function siteTagLine(siteCtxOrTag) {
  const ctx =
    typeof siteCtxOrTag === 'object' && siteCtxOrTag !== null
      ? siteCtxOrTag
      : { tag: String(siteCtxOrTag ?? 'ЗАЯВКА') };
  if (ctx.tag === 'TEST') {
    return '<b>TEST</b> · Тест muzhskoy-psikholog.ru';
  }
  return `<b>${ctx.tag || 'ЗАЯВКА'}</b>`;
}

function displayPageUrl(url, fallbackHome) {
  const fallback = fallbackHome || SITE_MALE_HOME;
  const s = String(url ?? '').trim();
  if (!s) return fallback;
  try {
    const u = new URL(s);
    const host = u.hostname.toLowerCase();
    const site = siteFromHost(host);
    if (site) {
      return `${site.home.replace(/\/$/, '')}${u.pathname || '/'}`;
    }
    return u.origin + (u.pathname || '/');
  } catch {
    return fallback;
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
  const home = meta.siteCtx?.home || SITE_MALE_HOME;
  return [
    '',
    'Дополнительная информация:',
    `Страница заявки: ${escHtml(displayPageUrl(meta.pageUrl, home))}`,
    `UTM source: ${escHtml(dash(meta.utmSource))}`,
    `UTM medium: ${escHtml(dash(meta.utmMedium))}`,
    `UTM campaign: ${escHtml(dash(meta.utmCampaign))}`,
    `UTM content: ${escHtml(dash(meta.utmContent))}`,
    `UTM term: ${escHtml(dash(meta.utmTerm))}`,
  ].join('\n');
}

function buildCallbackMessage(data) {
  const siteCtx = data.siteCtx || detectSiteContext({ pageUrl: data.pageUrl });
  const page = String(data.pageUrl || '').toLowerCase();
  const isKaliningrad = page.includes('/kaliningrad');
  const title =
    siteCtx.tag === 'TEST'
      ? 'Заявка с формы'
      : siteCtx.tag === 'СЕМЕЙНЫЙ' && isKaliningrad
        ? 'Заявка с формы (очно / Калининград)'
        : siteCtx.tag === 'СЕМЕЙНЫЙ'
          ? 'Заявка с формы'
          : 'Заявка с формы (обратный звонок)';
  const note = data.comment ? String(data.comment).trim().slice(0, 500) : '';
  const lines = [
    siteTagLine(siteCtx),
    title,
    '',
    `Имя: ${escHtml(dash(data.name))}`,
    phoneLineHtml(data.phone),
    `Способ связи: ${escHtml(formatContactMethods(data.contactMethods))}`,
  ];
  if (note) {
    lines.push('', `Комментарий: ${escHtml(note)}`);
  }
  lines.push(metaBlock({ ...data, siteCtx }));
  return lines.join('\n');
}

function buildFamilyCallbackMessage(data) {
  const siteCtx = data.siteCtx || detectSiteContext({
    pageUrl: data.pageUrl,
    origin: data.origin,
    referer: data.referer,
  });
  const note = data.comment ? String(data.comment).trim().slice(0, 500) : '';
  const lines = [
    familyCallbackTitle(data.pageUrl, data.referer),
    '',
    `Имя: ${escHtml(dash(data.name))}`,
    phoneLinePlain(data.phone),
    `Способ связи: ${escHtml(formatContactMethods(data.contactMethods))}`,
  ];
  if (note) {
    lines.push(`Комментарий: ${escHtml(note)}`);
  }
  lines.push(metaBlock({ ...data, siteCtx }));
  return lines.join('\n');
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
  const siteCtx = data.siteCtx || detectSiteContext({ pageUrl: data.pageUrl });
  const t = resolveTherapy(data);
  const clientTz = data.clientTimezone || PSY_TZ;
  const note = data.comment ? String(data.comment).trim().slice(0, 500) : '';
  const lines = [
    siteTagLine(siteCtx),
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
  lines.push(metaBlock({ ...data, siteCtx }));
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

function idempotencyCacheRequest(rawKey) {
  const key = String(rawKey ?? '').trim().slice(0, IDEMPOTENCY_KEY_MAX);
  if (!key) return null;
  return new Request(`https://psi-leads.idem/${encodeURIComponent(key)}`);
}

async function idempotencyHit(cacheReq) {
  if (!cacheReq) return false;
  const hit = await caches.default.match(cacheReq);
  return Boolean(hit);
}

async function idempotencyStore(cacheReq) {
  if (!cacheReq) return;
  await caches.default.put(
    cacheReq,
    new Response('1', {
      headers: { 'Cache-Control': `max-age=${IDEMPOTENCY_TTL_SEC}` },
    })
  );
}

function clientIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    ''
  );
}

async function verifyTurnstile(token, env, ip) {
  const form = new URLSearchParams();
  form.set('secret', env.TURNSTILE_SECRET_KEY);
  form.set('response', token);
  if (ip) form.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) return false;
  const data = await res.json();
  return Boolean(data && data.success);
}

/**
 * Persist form lead to anna-backend Postgres (Bookings stay out — source=booking skips this).
 * Prefer save-before-Telegram so a TG outage does not lose the lead.
 */
async function saveLeadToBackend(env, payload) {
  const url = String(env.BACKEND_LEADS_URL || 'https://anna-backend.ru/public/leads').trim();
  if (!url) return false;
  const headers = { 'Content-Type': 'application/json' };
  const secret = env.LEADS_INGEST_SECRET != null ? String(env.LEADS_INGEST_SECRET).trim() : '';
  if (secret) headers['X-Leads-Secret'] = secret;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => '');
      console.error('Backend leads save failed', res.status, bodyText.slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error('Backend leads save error', e && e.message ? e.message : 'unknown');
    return false;
  }
}

export default {
  async fetch(request, env) {
    const corsOrigin = resolveCorsOrigin(request);

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

      const idemHeader = request.headers.get('Idempotency-Key');
      const idemRaw =
        (idemHeader && String(idemHeader).trim()) ||
        (body.idempotencyKey != null ? String(body.idempotencyKey).trim() : '');
      const idemCacheReq = idempotencyCacheRequest(idemRaw);
      if (idemCacheReq && (await idempotencyHit(idemCacheReq))) {
        return Response.json({ ok: true }, { headers: corsHeaders });
      }

      if (env.TURNSTILE_SECRET_KEY) {
        const token = body.turnstileToken != null ? String(body.turnstileToken).trim() : '';
        if (!token) {
          return Response.json({ error: 'Captcha required' }, { status: 400, headers: corsHeaders });
        }
        const ip = clientIp(request);
        if (!(await verifyTurnstile(token, env, ip))) {
          return Response.json({ error: 'Captcha failed' }, { status: 403, headers: corsHeaders });
        }
      }

      if (!isValidName(body.name) || !isValidPhone(body.phone)) {
        return Response.json({ error: 'Invalid fields' }, { status: 400, headers: corsHeaders });
      }

      const referer = request.headers.get('Referer') || '';
      const siteCtx = detectSiteContext({
        pageUrl: body.pageUrl,
        origin: corsOrigin,
        referer,
      });
      const familyFromOrigin = siteFromUrlLike(corsOrigin)?.tag === 'СЕМЕЙНЫЙ';

      const meta = {
        pageUrl: body.pageUrl,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        utmContent: body.utmContent,
        utmTerm: body.utmTerm,
        siteCtx,
      };

      let text;

      if (body.source === 'booking') {
        if (!body.startIso) {
          return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
        }
        text = buildBookingMessage({ ...body, ...meta });
      } else if (familyFromOrigin || siteCtx.tag === 'СЕМЕЙНЫЙ') {
        text = buildFamilyCallbackMessage({
          ...body,
          ...meta,
          siteCtx: familyFromOrigin ? siteFromUrlLike(corsOrigin) : siteCtx,
          origin: corsOrigin,
          referer,
        });
      } else {
        text = buildCallbackMessage({ ...body, ...meta });
      }

      // Forms → Postgres first; calendar bookings already live in Booking table.
      let savedToDb = false;
      if (body.source !== 'booking') {
        const contactMethods = Array.isArray(body.contactMethods) ? body.contactMethods : [];
        savedToDb = await saveLeadToBackend(env, {
          name: String(body.name ?? '').trim(),
          phone: normalizePhone(body.phone) || String(body.phone ?? '').trim(),
          email: body.email != null ? String(body.email).trim() : undefined,
          contactMethods,
          comment: body.comment != null ? String(body.comment).trim().slice(0, 2000) : undefined,
          source: 'form',
          site: siteCtx.tag || undefined,
          pageUrl: body.pageUrl != null ? String(body.pageUrl).trim() : undefined,
          utmSource: body.utmSource != null ? String(body.utmSource).trim() : undefined,
          utmMedium: body.utmMedium != null ? String(body.utmMedium).trim() : undefined,
          utmCampaign: body.utmCampaign != null ? String(body.utmCampaign).trim() : undefined,
          utmContent: body.utmContent != null ? String(body.utmContent).trim() : undefined,
          utmTerm: body.utmTerm != null ? String(body.utmTerm).trim() : undefined,
          isTest: siteCtx.tag === 'TEST',
          raw: {
            origin: corsOrigin,
            referer,
            source: body.source || 'form',
          },
        });
        if (!savedToDb) {
          console.error('Lead DB save failed; continuing to Telegram');
        }
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
        // Form already in DB → still OK for the visitor; booking TG failure remains an error.
        if (savedToDb) {
          if (idemCacheReq) {
            await idempotencyStore(idemCacheReq);
          }
          return Response.json({ ok: true, telegram: false }, { headers: corsHeaders });
        }
        return Response.json({ error: 'Telegram error' }, { status: 502, headers: corsHeaders });
      }

      if (idemCacheReq) {
        await idempotencyStore(idemCacheReq);
      }

      return Response.json({ ok: true }, { headers: corsHeaders });
    } catch (e) {
      console.error('Worker error', e && e.message ? e.message : 'unknown');
      return Response.json({ error: 'Server error' }, { status: 500, headers: corsHeaders });
    }
  },
};
