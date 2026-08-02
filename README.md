# Психолог для мужчин (.рф)

Статический сайт (GitHub Pages) + Cloudflare Worker для заявок.

## Деплой сайта

```bash
git add -A
git commit -m "..."
git push origin main
```

GitHub Pages публикует ветку `main` (домен — в `CNAME`).

## Деплой Worker (лиды → Telegram)

```bash
cd cloudflare
npx wrangler deploy
```

Секреты и переменные окружения задаются в Cloudflare Dashboard → Worker `psi-leads`. Подробности — в комментариях в `cloudflare/psi-leads-worker.js`.

## Календарь vs инд. 90 мин

Виджет записи сейчас отдаёт **individual 50** и **family 90**. Индивидуальная 90 мин — через форму или мессенджеры, пока в виджет не добавят третий тип.
