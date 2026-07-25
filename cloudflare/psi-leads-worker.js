/**
 * Cloudflare Worker: заявки с сайта → Telegram.
 * Settings → Variables: BOT_TOKEN (encrypt), CHAT_ID = 382337050
 */
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

function formatWhen(startIso, endIso, tz) {
  if (!startIso) return '—';
  try {
    const zone = tz || 'Europe/Moscow';
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : null;
    const datePart = start.toLocaleDateString('ru-RU', { timeZone: zone, day: 'numeric', month: 'long', year: 'numeric' });
    const t0 = start.toLocaleTimeString('ru-RU', { timeZone: zone, hour: '2-digit', minute: '2-digit' });
    if (!end) return `${datePart}, ${t0}`;
    const t1 = end.toLocaleTimeString('ru-RU', { timeZone: zone, hour: '2-digit', minute: '2-digit' });
    return `${datePart}, ${t0} – ${t1}`;
  } catch {
    return startIso;
  }
}

const THERAPY = {
  individual: { title: 'Индивидуальная', duration: '50 мин', price: '4 500 ₽' },
  family: { title: 'Семейная (парная)', duration: '90 мин', price: '7 000 ₽' },
};

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
      const {
        name,
        phone,
        website,
        source,
        contactMethods,
        therapyType,
        startIso,
        endIso,
        clientTimezone,
        comment,
      } = body;

      if (website) {
        return Response.json({ ok: true }, { headers: corsHeaders });
      }

      const safeName = String(name || '').slice(0, 120);
      const safePhone = String(phone || '').slice(0, 40);
      const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

      let text;

      if (source === 'booking') {
        if (!safeName || !safePhone || !startIso) {
          return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
        }
        const t = THERAPY[therapyType] || THERAPY.individual;
        const when = formatWhen(startIso, endIso, clientTimezone);
        const safeComment = comment ? String(comment).slice(0, 500) : '';
        text = `📅 Запись через календарь\n\n👤 ${safeName}\n📞 ${safePhone}\n📋 ${t.title}, ${t.duration}, ${t.price}\n🕐 ${when}\n${safeComment ? '💬 ' + safeComment + '\n' : ''}⏱ ${now}`;
      } else {
        if (!safeName || !safePhone) {
          return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
        }
        const methods = Array.isArray(contactMethods)
          ? contactMethods.map((m) => String(m).slice(0, 40)).filter(Boolean)
          : [];
        const contactLine = methods.length ? methods.join(', ') : 'не указано';
        text = `📩 Заявка с формы сайта\n\n👤 ${safeName}\n📞 ${safePhone}\n📲 Связаться: ${contactLine}\n🕐 ${now}`;
      }

      const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.CHAT_ID, text }),
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
