#!/usr/bin/env bash
# Pasang semua tambahan ke index.html baru dari sumber: logo → materi kuliah → 4 bahasa.
# Pakai: tools/bangun.sh <index.html mentah dari sumber> [keluar, bawaan: index.html]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; IN="$1"; OUT="${2:-$ROOT/index.html}"; TMP="$(mktemp -d)"
cp "$IN" "$TMP/0.html"
python3 -I "$ROOT/tools/pasang_logo.py" "$TMP/0.html" "$ROOT/assets/logo"
python3 -I "$ROOT/tools/pasang_logo_bar.py" "$TMP/0.html" "$ROOT/assets/logo"
python3 -I "$ROOT/tools/materi/pasang_materi.py" "$TMP/0.html" "$TMP/1.html"
"$ROOT/tools/i18n/terapkan.sh" "$TMP/1.html" "$OUT"
rm -rf "$TMP" "$ROOT/tools/i18n/node_modules" "$ROOT/tools/i18n/package-lock.json"
echo "selesai → $OUT"
