#!/usr/bin/env bash
# Base musicale per PoshReel: segmento del brano + passa-basso finale sul logo.
# Uso: scripts/posh_music_bed.sh public/posh/i-put-a-spell-on-you.mp3 public/posh/music_bed.wav
# I tempi vengono da scripts/posh_timing.py.
set -euo pipefail
IN=$1; OUT=$2
read -r START LEN LP_AT < <(python3 "$(dirname "$0")/posh_timing.py")
echo "START=$START LEN=$LEN LP_AT=$LP_AT"
LP_DUR=1.5
ffmpeg -v error -y -ss "$START" -t "$LEN" -i "$IN" -filter_complex "
  [0:a]asplit[d][w];
  [w]lowpass=f=420,lowpass=f=420,volume=1.6[l];
  [d]volume='if(lt(t,$LP_AT),1,max(0,1-(t-$LP_AT)/$LP_DUR))':eval=frame[dv];
  [l]volume='if(lt(t,$LP_AT),0,min(1,(t-$LP_AT)/$LP_DUR))':eval=frame[lv];
  [dv][lv]amix=inputs=2:normalize=0" -ar 44100 "$OUT"
