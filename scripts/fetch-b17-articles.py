#!/usr/bin/env python3
"""Fetch b17 article HTML, first content image, save metadata for blog rebuild."""
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_IMG = ROOT / "assets" / "images" / "blog"
OUT_JSON = ROOT / "scripts" / "b17-articles.json"

ARTICLES = [
    ("zhena-hochet-razvoda", "https://www.b17.ru/article/zhena_hochet_razvoda_chto_delat/"),
    ("zhena-ne-hochet-imet-detey", "https://www.b17.ru/article/zhena_ne_hochet_imet_detey/"),
    ("govorit-li-zhene-ob-izmene", "https://www.b17.ru/article/govorit_li_zhene_ob_izmene/"),
    ("hochu-razvestis-s-zhenoy", "https://www.b17.ru/article/hochu_razvestis_s_zhenoy_statya_dlya_muzhchin/"),
    ("psiholog-dlya-muzhchin-v-krizise", "https://www.b17.ru/article/psiholog_dlya_muzhchin_v_krizise/"),
    ("hochu-izbavitsya-ot-revnosti", "https://www.b17.ru/article/hochu_izbavitsya_ot_revnosti/"),
    ("v-chem-smysl-zhizni", "https://www.b17.ru/article/v_chem_smysl_zhizni_vzglyad_psihologa/"),
    ("trevoga-chto-eto-otkuda", "https://www.b17.ru/article/trevoga_chto_eto_otkuda/"),
    ("kak-zabyt-cheloveka", "https://www.b17.ru/article/kak_zabyt_cheloveka_lyubimuyu/"),
]

UA = "Mozilla/5.0 (compatible; psi-blog-fetch/1.0)"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", errors="replace")


def first_article_image(html: str) -> str | None:
    # b17 article body images
    for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.I):
        src = m.group(1)
        if "avatar" in src or "logo" in src or "icon" in src:
            continue
        if "b17.ru" in src or src.startswith("/"):
            if src.startswith("//"):
                src = "https:" + src
            elif src.startswith("/"):
                src = "https://www.b17.ru" + src
            return src
    return None


def strip_tags(html: str) -> str:
    text = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<style[^>]*>.*?</style>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_article_block(html: str) -> str:
    m = re.search(r'class="article[^"]*text[^"]*"[^>]*>(.*?)</div>\s*<div',
                   html, re.S | re.I)
    if m:
        return m.group(1)
    m = re.search(r'itemprop="articleBody"[^>]*>(.*?)</div>', html, re.S | re.I)
    if m:
        return m.group(1)
    return html


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    dest.write_bytes(data)


def main():
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    results = []
    for slug, url in ARTICLES:
        print("fetch", slug)
        html = fetch(url)
        title_m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S | re.I)
        title = strip_tags(title_m.group(1)) if title_m else slug
        body = extract_article_block(html)
        img_url = first_article_image(body) or first_article_image(html)
        ext = ".jpg"
        if img_url:
            if ".webp" in img_url.lower():
                ext = ".webp"
            elif ".png" in img_url.lower():
                ext = ".png"
        cover_path = OUT_IMG / f"{slug}{ext}"
        if img_url:
            try:
                download(img_url, cover_path)
            except Exception as e:
                print("  img fail", e)
                cover_path = None
        else:
            cover_path = None
        results.append({
            "slug": slug,
            "url": url,
            "title_b17": title,
            "cover": str(cover_path.relative_to(ROOT)).replace("\\", "/") if cover_path and cover_path.exists() else None,
            "cover_url": img_url,
            "body_html": body[:500000],
            "plain_len": len(strip_tags(body)),
        })
    OUT_JSON.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", OUT_JSON)


if __name__ == "__main__":
    main()
