#!/usr/bin/env python3
"""把「全球植物病蟲害週報」頁面整理成網站資料。

用法：python3 -I _tools/weekly_sync.py <週報 index.html> <週報 img 資料夾>
產生：_data/weekly_issues.yml（各期重點）與 assets/weekly/<日期>/NN.webp（插圖，動圖另附 NN.jpg 靜態圖）。
已轉好的插圖不會重做。
"""
import html, os, re, struct, sys
import yaml
from PIL import Image

SRC, IMG = sys.argv[1], sys.argv[2]
OUT = 'assets/weekly'
CONT = {'亞洲', '歐洲', '美洲', '大洋洲', '非洲'}


def clean(t):
    return html.unescape(re.sub(r'<[^>]+>', '', t)).replace('台', '臺').strip()


BINOMIAL = re.compile(r'(?<![A-Za-z>])([A-Z][a-z]+ (?:[a-z]+\. )?[a-z]{3,}(?: (?:pv|f\. sp|var)\.? [a-z]+)?)(?![A-Za-z<])')


def italic(t):
    """學名一律斜體：把正文裡的屬名＋種小名包成 <em>。"""
    return BINOMIAL.sub(r'<em>\1</em>', t)


def durations(path):
    d = open(path, 'rb').read(); i = 12; out = []
    while i + 8 <= len(d):
        cid = d[i:i + 4]; sz = struct.unpack('<I', d[i + 4:i + 8])[0]
        if cid == b'ANMF':
            out.append(int.from_bytes(d[i + 20:i + 23], 'little'))
        i += 8 + sz + (sz & 1)
    return out


def convert(src, date, n):
    os.makedirs(f'{OUT}/{date}', exist_ok=True)
    dst = f'{OUT}/{date}/{n:02d}.webp'; still = dst[:-5] + '.jpg'
    im = Image.open(src); frames = getattr(im, 'n_frames', 1)
    if frames > 1:
        if not os.path.exists(dst):
            durs = durations(src) or [80] * frames
            fr = []
            for f in range(frames):
                im.seek(f); fr.append(im.convert('RGB').resize((640, 320), Image.LANCZOS))
            fr[0].save(dst, save_all=True, append_images=fr[1:], duration=durs[:frames], loop=0, quality=50, method=6)
            fr[frames // 2].save(still, quality=80)
        return dst, still
    if not os.path.exists(dst):
        im.convert('RGB').resize((800, 400), Image.LANCZOS).save(dst, quality=78, method=6)
    return dst, None


s = open(SRC, encoding='utf-8').read()
opts = dict(re.findall(r'<option value="(i[\d-]+)">([^<]+)</option>', s))
issues = []
for part in re.split(r'<div class="issue" id="', s)[1:]:
    iid = part[:part.index('"')]; date = iid[1:]
    num, d = [x.strip() for x in opts[iid].split('｜')]
    hl = [italic(clean(x)) for x in re.findall(r'<li>(.*?)</li>', part.split('</ol>')[0], re.S)]
    items = []
    for sec in re.split(r'<section class="sec"><h2>', part)[1:]:
        cat = clean(sec[:sec.index('<small>')])
        for a in re.split(r'<article id="', sec)[1:]:
            no = int(a[:a.index('"')].rsplit('-', 1)[1])
            tag = clean(re.search(r'<div class="tag">(.*?)</div>', a, re.S).group(1)).split('　')[0]
            cont = [c for c in re.split(r'[・／/]', tag) if c in CONT]
            region = '／'.join(x.split('・', 1)[-1] for x in tag.split('／'))
            title = italic(re.sub(r'^\d+\.\s*', '', clean(re.search(r'<h3>(.*?)</h3>', a, re.S).group(1))))
            m = re.search(r'<figcaption class="band">.*?<i>(.*?)</i>', a, re.S)
            sci = clean(m.group(1)) if m else ''
            if not sci:
                m = re.search(r'<div class="kw"><div>.*?<i>(.*?)</i>', a, re.S)
                sci = clean(m.group(1)) if m else ''
            sci = re.sub(r'\s*等$', '', sci)
            it = {'no': no, 'cat': cat, 'cont': cont, 'region': region, 'title': title}
            if sci:
                it['sci'] = sci
            src = os.path.join(IMG, date, f'{no:02d}.webp')
            dst = f'{OUT}/{date}/{no:02d}.webp'
            img = still = None
            if os.path.exists(src):
                img, still = convert(src, date, no)
            elif os.path.exists(dst):  # 這次沒下載、但之前已轉好的插圖
                img = dst
                still = dst[:-5] + '.jpg' if os.path.exists(dst[:-5] + '.jpg') else None
            if img:
                it['img'] = '/' + img
                if still:
                    it['still'] = '/' + still
            items.append(it)
    items.sort(key=lambda x: x['no'])
    issues.append({'issue': num, 'date': d, 'id': iid, 'highlights': hl, 'items': items})

head = '# 全球植物病蟲害週報各期重點（新到舊），由 _tools/weekly_sync.py 產生。全文在 url 的週報頁，網址加 #期別 id 可直接開該期\n'
body = yaml.safe_dump({'url': 'https://claude.ai/artifact/F4giETFJzRxQeqP952t59R', 'issues': issues},
                      allow_unicode=True, sort_keys=False, width=1000)
open('_data/weekly_issues.yml', 'w', encoding='utf-8').write(head + body)
print([(i['issue'], len(i['items']), sum('img' in x for x in i['items'])) for i in issues])
