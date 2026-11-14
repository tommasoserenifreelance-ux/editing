#!/usr/bin/env bash
# Base musicale per PoshReel: segmento del brano + passa-basso finale sul logo.
# Uso: scripts/posh_music_bed.sh public/posh/i-put-a-spell-on-you.mp3 public/posh/music_bed.wav
set -euo pipefail
IN=$1; OUT=$2
START=114.2   # drop del brano (148.2 s) sul reveal di Daisy's (34.0 s nel video)
LEN=43.1      # durata del video
LP_AT=38.6    # inizio dissolvenza al nero / logo
LP_DUR=1.5
ffmpeg -v error -y -ss "$START" -t "$LEN" -i "$IN" -filter_complex "
  [0:a]asplit[d][w];
  [w]lowpass=f=420,lowpass=f=420,volume=1.6[l];
  [d]volume='if(lt(t,$LP_AT),1,max(0,1-(t-$LP_AT)/$LP_DUR))':eval=frame[dv];
  [l]volume='if(lt(t,$LP_AT),0,min(1,(t-$LP_AT)/$LP_DUR))':eval=frame[lv];
  [dv][lv]amix=inputs=2:normalize=0" -ar 44100 "$OUT"
