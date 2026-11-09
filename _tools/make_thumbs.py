#!/usr/bin/env python3
"""替案件與參訪照片產生縮圖（列表、卡片、地圖清單與相片格用），原圖不動。

用法：python3 -I _tools/make_thumbs.py
產生 assets/thumbs/<cases|visits>/<資料夾>/<檔名>.webp，最長邊 640px。已有的縮圖不重做。
新增照片後執行一次即可（照片已先去除 GPS、加好浮水印）。
"""
import glob, os
from PIL import Image, ImageOps

n = 0
for src in sorted(glob.glob('assets/cases/*/*.jpg') + glob.glob('assets/visits/*/*.jpg')):
    dst = 'assets/thumbs/' + src[len('assets/'):-4] + '.webp'
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        continue
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    im.thumbnail((640, 640), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=74, method=6)  # 不帶 EXIF
    n += 1
print('縮圖', n, '張')
