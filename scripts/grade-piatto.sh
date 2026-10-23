#!/bin/sh
# Colour grade for the plate video: warmer whites, less blue cast, a touch
# more contrast and saturation. Writes a silent graded copy next to the source.
set -e
cd "$(dirname "$0")/.."
ffmpeg -y -i public/piatto/timeline_1.mp4 -an \
  -vf "colorbalance=rs=0.035:bs=-0.055:rm=0.04:gm=0.01:bm=-0.055:rh=0.02:bh=-0.03,eq=contrast=1.07:saturation=1.12:brightness=0.01:gamma=0.98,unsharp=5:5:0.35" \
  -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p \
  public/piatto/timeline_1_graded.mp4
