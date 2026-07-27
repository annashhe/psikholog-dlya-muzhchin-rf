# Психолог для мужчин (.рф)

Статический сайт (GitHub Pages) + Cloudflare Worker для заявок.

## Деплой сайта

```bash
git add -A
git commit -m "..."
git push origin main
```

GitHub Pages публикует ветку `main` на домен из `CNAME` (`xn-----glcflhfsdlncbk4a6bya1c4j.xn--p1ai`).

## Деплой Worker (лиды → Telegram)

```bash
cd cloudflare
npx wrangler deploy
```

Секреты в Cloudflare Dashboard → Worker `psi-leads` → Variables: `BOT_TOKEN`, `CHAT_ID`.

Опционально: `TURNSTILE_SECRET_KEY` — если задан, Worker требует `turnstileToken` в теле (нужен виджет Turnstile на формах). Без секрета поведение как раньше.

Клиент шлёт `Idempotency-Key`, чтобы повторная отправка не дублировала сообщение в Telegram.

## Проверка www / http → apex

```bash
curl -sI http://xn-----glcflhfsdlncbk4a6bya1c4j.xn--p1ai/
curl -sI https://www.xn-----glcflhfsdlncbk4a6bya1c4j.xn--p1ai/
nslookup www.xn-----glcflhfsdlncbk4a6bya1c4j.xn--p1ai
```

Ожидание: `301/302` на `https://xn-----.../` (или IDN-эквивалент). Если `www` не резолвится — добавить CNAME `www` → apex в DNS регистратора и редирект (лучше через Cloudflare proxy: HSTS + 301).

## Календарь vs инд. 90 мин

Виджет (`anna-psy-schedule-frontend`) сейчас отдаёт только **individual 50** и **family 90**. Индивидуальная 90 мин — реальный продукт; запись через форму/мессенджеры, пока в виджет не добавят третий тип.
