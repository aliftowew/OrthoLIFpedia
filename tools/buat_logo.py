import sys, numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = np.array(Image.open(src).convert('RGB')).astype(float)
NAVY = np.array([22,71,94.]); GREEN = np.array([88,150,93.])
R,G,B = im[...,0], im[...,1], im[...,2]
hijau = (G - B) > 18
# alpha: blend antara putih dan warna depan, dihitung dari kanal merah
a_navy = (254 - R) / (254 - NAVY[0]); a_green = (254 - R) / (254 - GREEN[0])
alpha = np.clip(np.where(hijau, a_green, a_navy), 0, 1)
alpha[alpha < 0.04] = 0
def rgba(navy, green):
    rgb = np.where(hijau[...,None], green, navy)
    return np.dstack([rgb, alpha*255]).astype(np.uint8)
terang = rgba(NAVY, GREEN)
gelap = rgba(np.array([230,240,248.]), np.array([111,191,120.]))
def simpan(arr, box, w, nama, pad=0):
    x0,y0,x1,y1 = box
    img = Image.fromarray(arr[y0:y1, x0:x1], 'RGBA')
    h = round(w * img.height / img.width)
    img = img.resize((w, h), Image.LANCZOS)
    img.save(f'{out}/{nama}.png', optimize=True)
    return img
PENUH = (455, 378, 1945, 1412)   # gambar + tulisan
MARKA = (1000, 378, 1530, 972)   # sosok + daun (tanpa buku) untuk favicon
simpan(terang, PENUH, 440, 'logo-penuh')
simpan(gelap, PENUH, 440, 'logo-penuh-gelap')
# favicon: gambar saja di kotak putih membulat
m = Image.fromarray(terang[MARKA[1]:MARKA[3], MARKA[0]:MARKA[2]], 'RGBA')
for s in (64, 180, 512):
    kanvas = Image.new('RGBA', (s, s), (0,0,0,0))
    from PIL import ImageDraw
    ImageDraw.Draw(kanvas).rounded_rectangle([0,0,s-1,s-1], radius=round(s*0.22), fill=(255,255,255,255))
    pad = round(s*0.08); inner = s - 2*pad
    mm = m.copy(); mm.thumbnail((inner, inner), Image.LANCZOS)
    kanvas.alpha_composite(mm, ((s-mm.width)//2, (s-mm.height)//2))
    kanvas.save(f'{out}/favicon-{s}.png', optimize=True)
print('ok')

# ---- logo mendatar (gambar kiri, tulisan kanan) & marka kecil untuk bar atas ----
GAMBAR = (750, 378, 1700, 1112)   # sosok + daun + buku
TULISAN = (455, 1170, 1945, 1412)
def potong(arr, box):
    x0,y0,x1,y1 = box
    img = Image.fromarray(arr[y0:y1, x0:x1], 'RGBA')
    return img.crop(img.getbbox())
for warna, arr in (('', terang), ('-gelap', gelap)):
    H = 132
    g = potong(arr, GAMBAR); g = g.resize((round(g.width*H/g.height), H), Image.LANCZOS)
    t = potong(arr, TULISAN); th = round(H*0.40); t = t.resize((round(t.width*th/t.height), th), Image.LANCZOS)
    jarak = round(H*0.16)
    k = Image.new('RGBA', (g.width + jarak + t.width, H), (0,0,0,0))
    k.alpha_composite(g, (0,0)); k.alpha_composite(t, (g.width + jarak, round(H*0.56 - th/2)))
    k.save(f'{out}/logo-mendatar{warna}.png', optimize=True)
    mk = potong(arr, (1000, 378, 1530, 972)); mk = mk.resize((round(mk.width*H/mk.height), H), Image.LANCZOS)
    mk.save(f'{out}/marka{warna}.png', optimize=True)
print('mendatar ok')
