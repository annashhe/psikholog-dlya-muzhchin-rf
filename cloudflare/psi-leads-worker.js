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
      const { name, phone, website } = await request.json();

      if (website) {
        return Response.json({ ok: true }, { headers: corsHeaders });
      }

      if (!name || !phone) {
        return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
      }

      const safeName = String(name).slice(0, 120);
      const safePhone = String(phone).slice(0, 40);

      const text = `📩 Новая заявка с сайта\n\n👤 ${safeName}\n📞 ${safePhone}\n🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;

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
