"""Pasang 4 bahasa (id, en, zh, uz) ke index.html yang literalnya sudah dibungkus __T(i,"...") oleh transform.js.
Pakai: python3 -I pasang_bahasa.py <masuk.html> <strings.json> <dir memori (zh.json, uz.json)> <keluar.html>
Memori terjemahan: {"teks sumber": "terjemahan"}; teks yang belum ada terjemahannya tampil versi Inggris/Indonesia."""
import json, sys, os
masuk, strings_path, memdir, keluar = sys.argv[1:5]
s = open(masuk, encoding='utf-8').read()
daftar = json.load(open(strings_path, encoding='utf-8'))

def ganti(lama, baru, n=1):
    global s
    c = s.count(lama)
    assert c == n, (lama[:90], c)
    s = s.replace(lama, baru)

# 1. pengatur bahasa di <head>
awal = s.index('/* Bahasa tampilan: "id" (bawaan) atau "en"')
akhir = s.index('</script>', awal)
skrip_bahasa = r'''/* Bahasa tampilan: id (bawaan), en, zh (简体中文), uz (Oʻzbekcha). Tombol bahasa atau ?lang=xx.
   Kode lama memilih teks lewat window.__EN__ (true untuk semua bahasa selain id);
   teks Inggris/Indonesia lalu diterjemahkan ke zh/uz oleh window.__T dari kamus #i18n-zh / #i18n-uz. */
(function () {
  var DAFTAR = ["id", "en", "zh", "uz"], KUNCI = "ortholifpedia.v1.bahasa", lang = "id", simpan = true;
  try {
    var q = new URLSearchParams(location.search).get("lang");
    if (DAFTAR.indexOf(q) >= 0) { lang = q; localStorage.setItem(KUNCI, JSON.stringify(q)); }
    else { var t = JSON.parse(localStorage.getItem(KUNCI) || "null"); if (DAFTAR.indexOf(t) >= 0) lang = t; }
  } catch (e) { simpan = false; }
  window.__LANG__ = lang;
  window.__EN__ = lang !== "id";
  document.documentElement.lang = { id: "id", en: "en", zh: "zh-Hans", uz: "uz-Latn" }[lang];
  var kamus = null;
  window.__T = function (i, s) {
    if (lang !== "zh" && lang !== "uz") return s;
    if (kamus === null) {
      kamus = [];
      try { var el = document.getElementById("i18n-" + lang); if (el) kamus = JSON.parse(el.textContent); } catch (e) {}
    }
    var t = kamus[i];
    return typeof t === "string" && t ? t : s;
  };
  var JUDUL = {
    en: "OrthoLIFpedia · Interactive orthopaedic trauma encyclopedia",
    zh: "OrthoLIFpedia · 创伤骨科交互式百科",
    uz: "OrthoLIFpedia · Ortopedik travmatologiya boʻyicha interaktiv ensiklopediya"
  };
  if (JUDUL[lang]) document.title = JUDUL[lang];
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest("[data-bahasa]") : null;
    if (!b || b.getAttribute("data-bahasa") === lang) return;
    var pilih = b.getAttribute("data-bahasa"), url = new URL(location.href);
    try { localStorage.setItem(KUNCI, JSON.stringify(pilih)); } catch (e) { simpan = false; }
    if (url.searchParams.has("lang") || !simpan) {
      if (pilih === "id" && simpan) url.searchParams.delete("lang"); else url.searchParams.set("lang", pilih);
      location.replace(url.href);
    } else location.reload();
  });
})();
'''
s = s[:awal] + skrip_bahasa + s[akhir:]

# 2. tombol bahasa (topbar & sidebar) jadi 4 pilihan
ganti('''let fa=window.__EN__===!0;return L(`<div class="pilih-bahasa" role="group" aria-label="${fa?"Language":"Bahasa"}"><button type="button" data-bahasa="id" lang="id" title="Bahasa Indonesia" aria-pressed="${!fa}">ID</button><button type="button" data-bahasa="en" lang="en" title="English" aria-pressed="${fa}">EN</button></div>`)}''',
      '''let fa=window.__LANG__||"id",lb={id:"Bahasa",en:"Language",zh:"语言",uz:"Til"};return L(`<div class="pilih-bahasa" role="group" aria-label="${lb[fa]}"><button type="button" data-bahasa="id" lang="id" title="Bahasa Indonesia" aria-pressed="${fa==="id"}">ID</button><button type="button" data-bahasa="en" lang="en" title="English" aria-pressed="${fa==="en"}">EN</button><button type="button" data-bahasa="zh" lang="zh-Hans" title="简体中文" aria-pressed="${fa==="zh"}">中文</button><button type="button" data-bahasa="uz" lang="uz-Latn" title="Oʻzbekcha" aria-pressed="${fa==="uz"}">UZ</button></div>`)}''')
ganti('''<span class="label-bahasa">${window.__EN__?"Language":"Bahasa"}</span>''',
      '''<span class="label-bahasa">${{id:"Bahasa",en:"Language",zh:"语言",uz:"Til"}[window.__LANG__||"id"]}</span>''')
# di layar sempit, pilihan bahasa di bar atas disembunyikan (tetap ada di menu samping)
ganti('.pilih-bahasa button[aria-pressed="true"] {',
      '@media (max-width: 520px) { .bar-aksi .pilih-bahasa { display: none; } }\n.pilih-bahasa button[aria-pressed="true"] {')

# subjudul "bahasa lain" (judul bab, label simpul klasifikasi): di zh/uz akan berisi teks Indonesia -> sembunyikan
ganti('<div class="judul-en">${window.__EN__?o.judul.id:o.judul.en}</div>',
      '${window.__LANG__==="zh"||window.__LANG__==="uz"?"":`<div class="judul-en">${window.__EN__?o.judul.id:o.judul.en}</div>`}')
ganti('<small>${q(window.__EN__?Y.label.id:Y.label.en)}</small>',
      '${window.__LANG__==="zh"||window.__LANG__==="uz"?"":`<small>${q(window.__EN__?Y.label.id:Y.label.en)}</small>`}')

# 3. kamus zh & uz (array sesuai indeks __T)
tambahan = ''
laporan = []
for kode in ('zh', 'uz'):
    p = os.path.join(memdir, kode + '.json')
    mem = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
    arr = [mem.get(d['s'], '') for d in daftar]
    laporan.append(f'{kode}: {sum(1 for x in arr if x)}/{len(arr)} teks')
    js = json.dumps(arr, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    tambahan += f'<script type="application/json" id="i18n-{kode}">{js}</script>\n'
bundle = s.rindex('<script>(()=>{')
s = s[:bundle] + tambahan + s[bundle:]
open(keluar, 'w', encoding='utf-8').write(s)
print('ok;', '; '.join(laporan), '; ukuran', len(s.encode('utf-8')))
