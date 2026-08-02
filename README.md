# Психолог для мужчин (.рф)

Статический сайт (GitHub Pages) + Cloudflare Worker для заявок.

## Деплой сайта

```bash
git add -A
git commit -m "..."
git push origin main
```

GitHub Pages публикует ветку `main` (домен — в `CNAME`).

## Деплой Worker (лиды → Postgres + Telegram)

```bash
cd cloudflare
npx wrangler secret put LEADS_INGEST_SECRET   # тот же секрет, что на VPS
npx wrangler deploy
```

Секреты: `BOT_TOKEN`, `CHAT_ID`, `LEADS_INGEST_SECRET`. Опционально `BACKEND_LEADS_URL` (default `https://anna-backend.ru/public/leads`).  
После валидации формы Worker сначала пишет Lead в anna-backend, затем шлёт Telegram. UI: `https://anna-backend.ru/leads/`.

## Календарь vs инд. 90 мин

Виджет записи сейчас отдаёт **individual 50** и **family 90**. Индивидуальная 90 мин — через форму или мессенджеры, пока в виджет не добавят третий тип.
