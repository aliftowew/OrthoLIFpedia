import sys, base64
html_path, d = sys.argv[1], sys.argv[2]
uri = lambda n: 'data:image/png;base64,' + base64.b64encode(open(f'{d}/{n}.png','rb').read()).decode()
s = open(html_path, encoding='utf-8').read()
def ganti(lama, baru, n=1):
    global s
    c = s.count(lama); assert c == n, (lama[:80], c)
    s = s.replace(lama, baru)
# variabel tema gelap (dua blok gelap)
ganti('--logo: var(--logo-gelap);', '--logo: var(--logo-gelap); --logo-mendatar: var(--logo-mendatar-gelap); --marka: var(--marka-gelap);', 2)
# CSS
ganti('.logo-ortholif { display: block;',
  f':root {{ --logo-mendatar-terang: url("{uri("logo-mendatar")}"); --logo-mendatar-gelap: url("{uri("logo-mendatar-gelap")}"); --logo-mendatar: var(--logo-mendatar-terang);\n'
  f'  --marka-terang: url("{uri("marka")}"); --marka-gelap: url("{uri("marka-gelap")}"); --marka: var(--marka-terang); }}\n'
  '/* logo di bar atas: hanya saat sidebar tidak terlihat */\n'
  '.logo-bar { display: none; flex: none; box-sizing: content-box; height: 2.3rem; aspect-ratio: 529 / 132; padding-right: 0.8rem; border-right: 1px solid var(--line);'
  ' background: var(--logo-mendatar) left center / contain no-repeat; background-origin: content-box; }\n'
  '.app.menu-sembunyi .logo-bar { display: block; }\n'
  '@media (max-width: 960px) { .logo-bar { display: block; } }\n'
  '@media (max-width: 600px) { .logo-bar { aspect-ratio: 113 / 132; height: 2rem; padding-right: 0; border-right: 0; margin: 0 -0.15rem; background-image: var(--marka); } }\n'
  '@media (max-width: 420px) { .app .bar-atas { gap: 0.4rem; padding-left: 0.6rem; padding-right: 0.6rem; } .app .bar-aksi { gap: 0.3rem; } }\n'
  '.logo-ortholif { display: block;')
# markup
ganti('data-aksi="menu" title="${M("menu")} (M)">${h("menu")}</button>',
      'data-aksi="menu" title="${M("menu")} (M)">${h("menu")}</button>\n          <a class="logo-bar" href="#/" aria-label="OrthoLIFpedia" title="OrthoLIFpedia"></a>')
# kicker "OrthoLIFpedia" tidak diulang di bar atas (sudah ada logo)
ganti('p.textContent=Pi.kicker||""', 'p.textContent=Pi.kicker==="OrthoLIFpedia"?"":Pi.kicker||""')
open(html_path, 'w', encoding='utf-8').write(s); print('ok')
