#!/usr/bin/env bash
# Run batch.py one photo per process (keeps memory low). Usage: run_batch.sh assign.csv in_dir out_dir
set -u
csv=$1; in=$2; out=$3
here=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d)
grep -v '^#' "$csv" | while IFS= read -r line; do
  [ -z "$line" ] && continue
  echo "$line" > "$tmp/one.csv"
  python3 "$here/batch.py" "$tmp/one.csv" "$in" "$out" --workers 1 2>&1 | grep -E '^(done|FAIL)'
done
rm -rf "$tmp"
