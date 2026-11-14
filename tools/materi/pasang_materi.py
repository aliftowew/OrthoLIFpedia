"""Pasang menu & halaman "Materi kuliah" ke index.html (versi SEBELUM i18n).
Pakai: python3 -I tools/materi/pasang_materi.py <masuk.html> <keluar.html>
Data: materi/deck.json (meta 4 bahasa) + materi/bagian/<berkas>-*.json (isi per slide) + assets/materi/*.webp."""
import json, os, sys, glob
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
masuk, keluar = sys.argv[1:3]
s = open(masuk, encoding='utf-8').read()
def ganti(lama, baru):
    global s
    assert s.count(lama) == 1, (lama[:80], s.count(lama))
    s = s.replace(lama, baru)
# data
deck = json.load(open(f'{ROOT}/materi/deck.json', encoding='utf-8'))
gambar = {}
for f in sorted(glob.glob(f'{ROOT}/assets/materi/*.webp')):
    w, h = Image.open(f).size
    gambar[os.path.basename(f)[:-5]] = {'file': 'assets/materi/' + os.path.basename(f), 'w': w, 'h': h}
for d in deck:
    bag = []
    for f in sorted(glob.glob(f"{ROOT}/materi/bagian/{d['berkas']}-*.json")):
        bag += json.load(open(f, encoding='utf-8'))
    bag.sort(key=lambda x: x['slide'])
    d['bagian'] = bag
    del d['berkas']
data = json.dumps({'deck': deck, 'gambar': gambar}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
css = open(f'{ROOT}/tools/materi/materi.css', encoding='utf-8').read()
js = open(f'{ROOT}/tools/materi/materi.js', encoding='utf-8').read()
# 1. gaya
i = s.index('</style>'); s = s[:i] + '\n' + css + s[i:]
# 2. data + modul sebelum bundle aplikasi
b = s.rindex('<script>(()=>{')
s = s[:b] + f'<script type="application/json" id="data-materi">{data}</script>\n<script>/* materi */\n{js}</script>\n' + s[b:]
# 3. rute #/materi
ganti('Pi==="glosarium"?_o(B):_l():_l()', 'Pi==="glosarium"?_o(B):Pi==="materi"&&window.__MATERI?window.__MATERI.halaman(B,La):_l():_l()')
# 4. menu samping: grup "Materi kuliah" setelah grup Alat
ganti('<span class="teks">${ar}</span></a>`).join("")+"</div>");let La=Xs.map(',
      '<span class="teks">${ar}</span></a>`).join("")+"</div>");window.__MATERI&&wi.push(window.__MATERI.nav(fa));let La=Xs.map(')
open(keluar, 'w', encoding='utf-8').write(s)
print('ok:', ', '.join(f"{d['id']} {len(d['bagian'])} bagian" for d in deck), '| gambar', len(gambar))
