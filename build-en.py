"""Builds the static English pages (en/index.html, en/products.html) from the Arabic pages
and the dictionary in i18n.js, and adds the SEO tags to every page.

Run from this folder:  python build-en.py
Edit Arabic text in index.html / products.html, English wording in i18n.js, then re-run.
"""
import json
import os
import re
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = 'https://caucasus-sweets-home.vercel.app'     # change this when a custom domain is connected

NODE = ("global.window={};eval(require('fs').readFileSync('i18n.js','utf8'));"
        "console.log(JSON.stringify({d:window.I18N_EN,m:window.I18N_META}))")
DATA = json.loads(subprocess.check_output(['node', '-e', NODE], cwd=HERE).decode('utf-8'))
EN = DATA['d']
META = {k: {kk: vv for kk, vv in v.items() if kk != 'copy'} for k, v in DATA['m'].items()}

BRANCHES = [
    dict(ar='دار الحلويات القوقازية – المدينة الرياضية', en='Caucasus Sweets Home – Sports City',
         street_ar='بوابة رقم ٤، مجمع ياسر السهلي، مقابل فندق الأرز',
         street_en='Gate 4, Yasser Al-Sahli Complex, opposite Al-Arz Hotel',
         tel='+962797181860', lat=31.9875934, lng=35.9032997, map='https://maps.app.goo.gl/BE7S87pSeu6PGaVT7'),
    dict(ar='دار الحلويات القوقازية – شارع مكة', en='Caucasus Sweets Home – Mecca Street',
         street_ar='مجمع جبر، الساحة الداخلية، شارع مكة',
         street_en='Jabr Complex, inner courtyard, Mecca Street',
         tel='+962796140001', lat=31.975402, lng=35.852672, map='https://maps.app.goo.gl/5fDBRqBGg8UrgTYP8'),
]


def jsonld(lang):
    graph = []
    for b in BRANCHES:
        graph.append({
            '@type': 'Bakery', 'name': b[lang],
            'url': SITE + ('/en/' if lang == 'en' else '/'),
            'image': SITE + '/img/og.jpg', 'telephone': b['tel'], 'hasMap': b['map'],
            'servesCuisine': 'Caucasian desserts',
            'address': {'@type': 'PostalAddress', 'streetAddress': b['street_' + lang],
                        'addressLocality': 'Amman', 'addressCountry': 'JO'},
            'geo': {'@type': 'GeoCoordinates', 'latitude': b['lat'], 'longitude': b['lng']},
            'openingHoursSpecification': {
                '@type': 'OpeningHoursSpecification',
                'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'opens': '10:00', 'closes': '22:00'},
            'sameAs': ['https://www.instagram.com/caucasus_sweets_home/',
                       'https://www.facebook.com/CAUCASUS.SWEETS.HOME'],
        })
    return ('<script type="application/ld+json">' +
            json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False) + '</script>\n')


def translate(html):
    """Replace each Arabic string by its English text: element contents and attribute values."""
    for ar in sorted(EN, key=len, reverse=True):
        en = EN[ar]
        html = re.sub(r'(>)\s*' + re.escape(ar) + r'\s*(<)', lambda m: m.group(1) + en + m.group(2), html)
        html = html.replace('="' + ar + '"', '="' + en.replace('"', '&quot;') + '"')
    return html


def esc(t):
    return t.replace('&', '&amp;').replace('"', '&quot;')


def head_tags(page, lang):
    path = {'index.html': '', 'products.html': 'products.html'}[page]
    ar_url, en_url = f'{SITE}/{path}', f'{SITE}/en/{path}'
    cur = en_url if lang == 'en' else ar_url
    m = META[lang]
    title = m['ptitle'] if page == 'products.html' else m['title']
    desc = m['pdesc'] if page == 'products.html' else m['desc']
    tags = (f'<link rel="canonical" href="{cur}">\n'
            f'<link rel="alternate" hreflang="ar" href="{ar_url}">\n'
            f'<link rel="alternate" hreflang="en" href="{en_url}">\n'
            f'<link rel="alternate" hreflang="x-default" href="{ar_url}">\n'
            f'<meta property="og:type" content="website">\n<meta property="og:url" content="{cur}">\n'
            f'<meta property="og:title" content="{esc(title)}">\n<meta property="og:description" content="{esc(desc)}">\n'
            f'<meta property="og:image" content="{SITE}/img/og.jpg">\n'
            f'<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            f'<meta property="og:locale" content="{"en_US" if lang == "en" else "ar_JO"}">\n'
            f'<meta name="twitter:card" content="summary_large_image">\n')
    return tags, title, desc


STRIP = re.compile(
    r'<link rel="canonical"[^>]*>\n|<link rel="alternate" hreflang[^>]*>\n'
    r'|<meta property="og:[a-z:_]+"[^>]*>\n?|<meta name="twitter:card"[^>]*>\n'
    r'|<script type="application/ld\+json">.*?</script>\n?', re.S)


def build(page, lang, source):
    s = STRIP.sub('', source)
    if lang == 'en':
        s = translate(s)
    tags, title, desc = head_tags(page, lang)
    s = re.sub(r'<html [^>]*>', f'<html lang="{lang}" dir="{"ltr" if lang == "en" else "rtl"}" data-lang="{lang}">', s, count=1)
    s = re.sub(r'<title>.*?</title>', '<title>' + title.replace('&', '&amp;') + '</title>', s, count=1, flags=re.S)
    s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + esc(desc) + '">', s, count=1)
    extra = tags + (jsonld(lang) if page == 'index.html' else '')
    return s.replace('<link rel="icon"', extra + '<link rel="icon"', 1)


for page in ('index.html', 'products.html'):
    path = os.path.join(HERE, page)
    source = open(path, encoding='utf-8').read()
    open(path, 'w', encoding='utf-8').write(build(page, 'ar', source))
    os.makedirs(os.path.join(HERE, 'en'), exist_ok=True)
    open(os.path.join(HERE, 'en', page), 'w', encoding='utf-8').write(build(page, 'en', source))
    print('built', page, 'and en/' + page)

sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for path in ('', 'products.html'):
    for lang in ('ar', 'en'):
        loc = f'{SITE}/{"en/" if lang == "en" else ""}{path}'
        sm.append(f'<url><loc>{loc}</loc><xhtml:link rel="alternate" hreflang="ar" href="{SITE}/{path}"/>'
                  f'<xhtml:link rel="alternate" hreflang="en" href="{SITE}/en/{path}"/></url>')
sm.append('</urlset>')
open(os.path.join(HERE, 'sitemap.xml'), 'w', encoding='utf-8').write('\n'.join(sm) + '\n')
open(os.path.join(HERE, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n')
print('sitemap.xml and robots.txt written')
