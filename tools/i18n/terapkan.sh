#!/usr/bin/env bash
# Pasang 4 bahasa (ID/EN/中文/UZ) ke index.html baru.
# Pakai: tools/i18n/terapkan.sh <index.html masuk> <index.html keluar>
# Memori terjemahan ada di i18n/zh.json & i18n/uz.json ({teks sumber: terjemahan}).
# Teks yang belum ada di memori tetap tampil dalam bahasa Inggris/Indonesia, dan dicatat di i18n/belum-diterjemahkan.json.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$DIR/../.." && pwd)"
TMP="$(mktemp -d)"
[ -d "$DIR/node_modules/@babel/parser" ] || (cd "$DIR" && npm install --silent @babel/parser@7.26.3 @babel/traverse@7.26.4)
node "$DIR/transform.js" "$1" "$TMP/out.html" "$TMP/strings.json"
python3 -I "$DIR/pasang_bahasa.py" "$TMP/out.html" "$TMP/strings.json" "$ROOT/i18n" "$2"
python3 -I - "$TMP/strings.json" "$ROOT/i18n" <<'PY'
import json, sys
W = json.load(open(sys.argv[1], encoding='utf-8'))
out = {}
for k in ('zh', 'uz'):
    m = json.load(open(f'{sys.argv[2]}/{k}.json', encoding='utf-8'))
    out[k] = [w['s'] for w in W if w['s'] not in m]
json.dump(out, open(f'{sys.argv[2]}/belum-diterjemahkan.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('belum diterjemahkan: zh', len(out['zh']), '· uz', len(out['uz']))
PY
rm -rf "$TMP"
