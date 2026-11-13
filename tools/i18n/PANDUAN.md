# Panduan penerjemahan OrthoLIFpedia

OrthoLIFpedia adalah ensiklopedia interaktif ortopedi trauma (dewasa & anak) untuk dokter/residen
ortopedi yang belajar ujian. Teks berasal dari Principles of Fracture Management (AO) dan Handbook of Fractures.

## Masukan
`paket/NN.json`: array item `{"i": nomor, "bahasa_sumber": "id"|"en", "konteks": ..., "teks": ...}`.
- `bahasa_sumber: "id"` → teks sumber Bahasa Indonesia.
- `bahasa_sumber: "en"` → teks sumber Bahasa Inggris (label antarmuka/nama).
- `konteks` hanya petunjuk asal teks (mis. `isi` = paragraf tatalaksana, `teks` = poin pemeriksaan,
  `judul` = judul bagian, `ui` = tombol/menu, `fn:...`/`svgteks` = label kecil di gambar SVG, `opsi` = pilihan kuis).

## Keluaran
`hasil/<bahasa>-NN.jsonl`, satu baris JSON per item: `{"i": nomor, "t": "terjemahan"}`.
Semua item paket wajib ada. Tulis file bertahap (mis. per 40–80 item, tambahkan ke file) supaya tidak terlalu panjang sekali tulis.
Setelah selesai jalankan pemeriksa dan perbaiki sampai `0 masalah`:
`python3 -I cek_hasil.py paket/NN.json hasil/<bahasa>-NN.jsonl`
Paling aman membuat JSONL lewat skrip Python kecil (json.dumps(..., ensure_ascii=False)) daripada menulis escape JSON dengan tangan.

## Aturan isi
1. Terjemahkan maknanya secara akurat dan alami untuk klinisi; gaya ringkas seperti sumber. Jangan menambah atau membuang informasi.
2. Pertahankan PERSIS: tag HTML/SVG beserta atributnya (`<text class="anot-teks" x="4" y="146">…</text>`, `<b>`, `<i>` …) — hanya teks di antara tag yang diterjemahkan; markdown (`**tebal**`, `*miring*`, baris `- ` dan `1. `); jumlah baris (`\n`) harus sama; angka, satuan, rentang, simbol (→ ≥ ≤ ± ° % ~ · ⅔ ①); tanda kutip miring/tunggal boleh disesuaikan.
3. Jangan terjemahkan: singkatan dan kode (ORIF, CRPP, K-wire, AO/OTA, 15.2A, IIIB, SH II, Gartland III, Neer, Garden, Schatzker, Weber B, DHS, LCP, MIPO, TAD, HoF, PFM…), nama eponim (Monteggia, Galeazzi, Barton, Smith…), nama implan bermerek. Boleh menambah padanan lokal dalam kurung bila istilah Inggris lazim dipakai.
4. Istilah anatomi & bedah gunakan terminologi medis baku bahasa tujuan.
5. Label sangat pendek (tombol, label gambar) tetap pendek.
6. Jangan menulis `${` dan jangan menambah backtick.

## Bahasa tujuan
- `zh` = Bahasa Mandarin Sederhana (简体中文, istilah ortopedi daratan Tiongkok, mis. 骨折, 切开复位内固定, 髓内钉, 钢板, 克氏针, 骨痂, 绝对稳定, 相对稳定, 负重). Gunakan tanda baca Tionghoa untuk kalimat (，。；：), tapi biarkan simbol/angka/kode Latin apa adanya.
- `uz` = Bahasa Uzbek aksara Latin (standar resmi), dengan huruf oʻ dan gʻ memakai U+02BB (ʻ), tanda pemisah ʼ (U+02BC). Istilah medis baku Uzbekistan (mis. suyak sinishi, ochiq repozitsiya va ichki fiksatsiya, intramedullyar mix, plastina, kallus, mutlaq barqarorlik, nisbiy barqarorlik, yuklama). Bila istilah Uzbek tidak lazim, pakai istilah internasional (Latin/Rusia-serapan) yang biasa dipakai dokter Uzbekistan.

## Daftar istilah wajib (agar seragam antarpaket)
| sumber | zh | uz |
|---|---|---|
| simple / simpel | 简单 | oddiy |
| wedge | 楔形 | ponasimon |
| multifragmentary / multifragmentari | 粉碎（多块） → pakai 粉碎 | koʻp boʻlakli |
| intertrochanteric / trochanteric (31-A) | 股骨转子间 / 转子区 | intertroxanterik / troxanter sohasi |
| torus / buckle | 竹节样骨折 | toʻrus (buckle) sinishi |
| greenstick | 青枝骨折 | „yashil novda“ sinishi |
| collar-and-cuff | 颈腕吊带 | boʻyin-bilak osmasi (collar-and-cuff) |
| absolute / relative stability | 绝对稳定 / 相对稳定 | mutlaq / nisbiy barqarorlik |
| callus / kalus | 骨痂 | kallus |
| physis / fisis | 骺板 | fizis (oʻsish plastinkasi) |
| nail (intramedullary) | 髓内钉 | intramedullyar mix |
| plate / plat | 钢板 | plastina |
| K-wire | 克氏针 | K-sim (Kirshner simi) |
| weight bearing | 负重 | oyoqqa yuklama |
| fracture / fraktur | 骨折 | sinish |
| displaced / bergeser | 移位 | siljigan |
| radius / ulna | 桡骨 / 尺骨 | bilak suyagi / tirsak suyagi |
| nonunion | 骨不连 | bitmaslik (psevdoartroz) |
| sling | 吊带 | osma bogʻlam |
| tension band | 张力带 | tension band (tortuvchi halqa) |
| bridge plate | 桥接钢板 | koʻprik plastina (bridge plate) |
| kolum femur (femoral neck) / kolum asetabulum | 股骨颈 / 前柱·后柱 | son suyagi boʻyni / oldingi·orqa ustun |
| desimal | ikuti sumber, tapi koma desimal Indonesia (2,4) boleh jadi titik (2.4) | koma desimal (2,4) tetap |
| K-wire | 克氏针 | K-sim (Kirshner simi) — selalu |

**Tautan internal** `[[slug|teks tampilan]]` atau `[[slug]]`: slug JANGAN diubah. Hanya teks tampilan setelah `|` yang diterjemahkan; untuk `[[slug]]` tanpa teks, tulis `[[slug|terjemahan]]`.
