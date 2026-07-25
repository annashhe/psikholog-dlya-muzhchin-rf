/**
 * Cloudflare Worker: заявки с сайта → Telegram.
 * Workers & Pages → Create Worker → вставить этот код → Deploy.
 * Settings → Variables: BOT_TOKEN (encrypt), CHAT_ID = 382337050
 */
export default {
  async fetch(request, env) {
    const allowedOrigins = [
      'https://психолог-для-мужчин.рф',
      'https://xn----7sbbap1bbh3anq.xn--p1ai',
      'https://annashhe.github.io',
    ];

    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
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
