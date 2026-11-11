import sys, base64, re
html_path, d = sys.argv[1], sys.argv[2]
uri = lambda n: 'data:image/png;base64,' + base64.b64encode(open(f'{d}/{n}.png','rb').read()).decode()
s = open(html_path, encoding='utf-8').read()
def ganti(lama, baru, n=1):
    global s
    c = s.count(lama)
    assert c == n, (lama[:80], c)
    s = s.replace(lama, baru)

# 1. favicon
lama_ikon = re.search(r'<link rel="icon" href="data:image/svg\+xml[^"]*">', s).group(0)
ganti(lama_ikon, f'<link rel="icon" type="image/png" sizes="64x64" href="{uri("favicon-64")}">\n'
                 f'<link rel="apple-touch-icon" sizes="180x180" href="{uri("favicon-180")}">\n'
                 '<meta name="theme-color" content="#16475e">')

# 2. CSS logo (gambar gelap disimpan sekali di variabel, lalu dipakai di blok tema gelap)
ganti(':root[data-theme="dark"] {\n',
      ':root[data-theme="dark"] {\n  --logo: var(--logo-gelap);\n')
ganti('@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n',
      '@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n    --logo: var(--logo-gelap);\n')
css_logo = (
  f'/* ---- logo OrthoLIFpedia ---- */\n'
  f':root {{ --logo-terang: url("{uri("logo-penuh")}"); --logo-gelap: url("{uri("logo-penuh-gelap")}"); --logo: var(--logo-terang); }}\n'
  '.logo-ortholif { display: block; width: 100%; aspect-ratio: 440 / 305; background: var(--logo) center / contain no-repeat; }\n'
)
ganti('.merek { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.5rem 0.25rem; text-decoration: none; color: inherit; }',
      css_logo +
      '.merek { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; padding: 0.5rem 0.5rem 0.5rem; text-decoration: none; color: inherit; text-align: center; }\n'
      '.merek .logo-ortholif { width: 11rem; max-width: 100%; }')
ganti('.pin-logo { font-weight: 800; font-size: 1.05rem; letter-spacing: -0.01em; } .pin-logo b { color: var(--accent); }',
      '.pin-logo { width: 10rem; max-width: 70%; }')

# 3. markup sidebar & layar PIN
ganti('<a class="merek" href="#/"><span class="merek-marka">${w0}</span><span><span class="merek-nama">Ortho<b>LIF</b>pedia</span><div class="merek-sub">',
      '<a class="merek" href="#/" aria-label="OrthoLIFpedia"><span class="logo-ortholif" role="img" aria-label="OrthoLIFpedia"></span><span><div class="merek-sub">')
ganti('<div class="pin-logo">Ortho<b>LIF</b>pedia</div>',
      '<div class="pin-logo logo-ortholif" role="img" aria-label="OrthoLIFpedia"></div>')
open(html_path, 'w', encoding='utf-8').write(s)
print('ok')
