"""Periksa hasil terjemahan satu paket.
Pakai: python3 -I cek_hasil.py <paket.json> <hasil.jsonl>
Setiap baris hasil: {"i": <nomor>, "t": "<terjemahan>"}"""
import json, re, sys
paket = json.load(open(sys.argv[1], encoding='utf-8'))
hasil = {}
masalah = []
for no, baris in enumerate(open(sys.argv[2], encoding='utf-8'), 1):
    baris = baris.strip()
    if not baris: continue
    try:
        o = json.loads(baris); hasil[int(o['i'])] = o['t']
    except Exception as e:
        masalah.append(f'baris {no}: JSON tidak valid ({e})')
tag = lambda s: sorted(re.findall(r'</?[A-Za-z][^<>]*>', s))
for it in paket:
    i, s = it['i'], it['teks']
    if i not in hasil: masalah.append(f'i={i}: belum diterjemahkan'); continue
    t = hasil[i]
    if not isinstance(t, str) or not t.strip(): masalah.append(f'i={i}: kosong'); continue
    if tag(s) != tag(t): masalah.append(f'i={i}: tag HTML/SVG berbeda dari sumber (harus identik, hanya teks di antara tag yang diterjemahkan)')
    if s.count('**') != t.count('**'): masalah.append(f'i={i}: jumlah ** berbeda')
    if s.count('\n') != t.count('\n'): masalah.append(f'i={i}: jumlah baris (\\n) berbeda ({s.count(chr(10))} vs {t.count(chr(10))})')
    if sorted(re.findall(r'\[\[([^|\]]+)', s)) != sorted(re.findall(r'\[\[([^|\]]+)', t)): masalah.append(f'i={i}: slug tautan [[slug|teks]] harus sama persis dengan sumber')
    if '${' in t: masalah.append(f'i={i}: tidak boleh ada ${{')
    if t.count('`') != s.count('`'): masalah.append(f'i={i}: jumlah backtick berbeda')
lebih = set(hasil) - {it['i'] for it in paket}
if lebih: masalah.append(f'nomor tidak dikenal: {sorted(lebih)[:10]}')
print(f'{len(hasil)}/{len(paket)} item, {len(masalah)} masalah')
for m in masalah[:60]: print(' -', m)
sys.exit(1 if masalah else 0)
