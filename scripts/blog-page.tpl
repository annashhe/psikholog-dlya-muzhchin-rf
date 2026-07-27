<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>{{TITLE}}</title>
    <meta name="description" content="{{DESC}}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="{{CANONICAL}}" />
    <meta property="og:title" content="{{TITLE}}" />
    <meta property="og:description" content="{{DESC}}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{CANONICAL}}" />
    <meta property="og:image" content="{{COVER_URL}}" />
    <meta property="og:locale" content="ru_RU" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{TITLE}}" />
    <meta name="twitter:description" content="{{DESC}}" />
    <meta name="twitter:image" content="{{COVER_URL}}" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="stylesheet" href="/assets/site-chrome.css" />
    <link rel="stylesheet" href="/assets/blog-article.css" />
    <link rel="stylesheet" href="/assets/copy-guard.css" />
    <script src="/assets/copy-guard.js" defer></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" />
    <style>
        :root { --accent: #802d4b; --muted: #6e6e6e; --border: #eae7ea; --bg: #f6f4f6; }
        html { color-scheme: light; background: #fff; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Manrope', sans-serif; line-height: 1.75; color: #1a1a1a; background: #fff; }
        .container { max-width: 720px; margin: 0 auto; padding: 0 24px; }
        .container-wide { max-width: 900px; margin: 0 auto; padding: 0 24px; }
        .breadcrumbs { background: var(--bg); border-bottom: 1px solid var(--border); padding: 10px 0; font-size: .85rem; }
        .breadcrumbs ol { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; }
        .breadcrumbs li { color: var(--muted); }
        .breadcrumbs li:not(:last-child)::after { content: '›'; margin-left: 6px; }
        .breadcrumbs a { color: var(--muted); text-decoration: none; }
        main { padding: 48px 0 32px; }
        .article-meta { color: var(--muted); font-size: .9rem; margin-bottom: 1.5rem; }
        h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); margin-bottom: .8rem; line-height: 1.25; color: var(--accent); }
        .note-box { background: var(--bg); padding: 1rem 1.2rem; margin: 1.5rem 0; border-radius: 12px; border: 1px solid var(--border); font-size: .95rem; color: #3d3d3d; }
    </style>
    <script type="application/ld+json">{{JSON_LD}}</script>
    <script src="/assets/cookie-notice.js" defer></script>
    <script src="/assets/consent-analytics.js" defer></script>
    <script src="/assets/analytics-events.js" defer></script>
    <script src="/assets/blog-analytics.js" defer></script>
    <script src="/assets/site-chrome.js" defer></script>
</head>
<body>
    <div id="psi-chrome-header"></div>

    <nav class="breadcrumbs" aria-label="Хлебные крошки">
        <div class="container-wide">
            <ol>
                <li><a href="{{SITE}}/">Главная</a></li>
                <li><a href="/blog/">Блог</a></li>
                <li aria-current="page">{{BREADCRUMB}}</li>
            </ol>
        </div>
    </nav>

    <main class="copy-protected">
        <article class="container">
            <header>
                <p class="article-meta"><time datetime="{{DATE}}">{{DISPLAY}}</time> · Автор: <a href="/#about">Анна Щеголихина</a>, психолог для мужчин онлайн</p>
                <h1>{{TITLE}}</h1>
                <img class="article-cover" src="/assets/images/blog/{{SLUG}}.jpg" width="720" height="720" alt="{{TITLE_ATTR}}" loading="eager" decoding="async" />
            </header>

            <div class="article-content">
{{BODY}}
            </div>
            <footer class="article-after">
                <p class="article-disclaimer">Статья носит ознакомительный характер и не заменяет консультацию специалиста. Материалы не являются медицинской услугой и не содержат гарантий результата.</p>
                <div id="psi-blog-cta">
                    <div class="psi-blog-cta">
                        <p class="psi-blog-cta-lead">Статья носит ознакомительный характер. Чтобы разобрать именно вашу ситуацию — запишитесь на консультацию.</p>
                        <div class="psi-blog-cta-btns">
                            <a href="{{SITE}}/#booking" class="psi-btn psi-btn-primary psi-btn-lg">Записаться онлайн</a>
                            <a href="{{SITE}}/#contact" class="psi-btn psi-btn-outline psi-btn-lg">Очно в Калининграде</a>
                        </div>
                    </div>
                </div>
            </footer>
        </article>
    </main>

    <div id="psi-chrome-footer"></div>
</body>
</html>
