#!/usr/bin/env bash
# Base musicale per PoshReel: segmento del brano + passa-basso finale sul logo.
# Uso: scripts/posh_music_bed.sh SONG  (chiave in src/PoshReel/songs.json)
# I tempi vengono da scripts/posh_timing.py.
set -euo pipefail
SONG=${1:-spell}
ROOT="$(dirname "$0")/.."
IN="$ROOT/public/posh/$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))[sys.argv[2]]['file'])" "$ROOT/src/PoshReel/songs.json" "$SONG")"
OUT="$ROOT/public/posh/music_bed_$SONG.wav"
read -r START LEN LP_AT < <(python3 "$(dirname "$0")/posh_timing.py" "$SONG")
echo "START=$START LEN=$LEN LP_AT=$LP_AT"
LP_DUR=1.5
# Niente saturazione: margine iniziale, parte filtrata senza spinte eccessive,
# dissolvenza lineare (le due parti non si sommano) e limitatore morbido di sicurezza.
ffmpeg -v error -y -ss "$START" -t "$LEN" -i "$IN" -filter_complex "
  [0:a]aformat=sample_fmts=fltp,volume=-2dB,asplit[d][w];
  [w]lowpass=f=450:p=2,lowpass=f=450:p=2[l];
  [d]volume='if(lt(t,$LP_AT),1,max(0,1-(t-$LP_AT)/$LP_DUR))':eval=frame[dv];
  [l]volume='if(lt(t,$LP_AT),0,min(1,(t-$LP_AT)/$LP_DUR))':eval=frame[lv];
  [dv][lv]amix=inputs=2:normalize=0,alimiter=limit=0.84:attack=5:release=80:level=false" -ar 44100 -c:a pcm_s16le "$OUT"
