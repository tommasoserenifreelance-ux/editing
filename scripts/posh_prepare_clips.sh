#!/usr/bin/env bash
# Prepara le clip verticali di PoshReel da public/posh/*.mov (release "posh").
# Richiede i .trf di vidstab generati con vidstabdetect (vedi commit) solo per il bar.
set -euo pipefail
cd "$(dirname "$0")/../public/posh"
OUT="scale=1080:1920:flags=lanczos,unsharp=5:5:0.4"
ENC="-an -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -movflags +faststart"
ffmpeg -y -i posh.1.mov -vf "crop=608:1080:656:0,$OUT" $ENC v/posh1.mp4
ffmpeg -y -i posh.daysis.mov -vf "crop=608:1080:656:0,$OUT" $ENC v/posh2.mp4
ffmpeg -y -i posh.bar.mov -vf "crop=608:1080:656:0,vidstabdetect=shakiness=8:accuracy=15:tripod=1:result=bar.trf" -f null -
ffmpeg -y -i posh.bar.mov -vf "crop=608:1080:656:0,vidstabtransform=input=bar.trf:tripod=1:optzoom=1:interpol=bicubic,$OUT" $ENC v/posh3.mp4
# Biliardo: raddrizzato seguendo il rollio misurato + colore più caldo, ombre più profonde.
ROT='(if(lt(t\,6.3)\,0+(0-(0))*(t-0)/6.3\,if(lt(t\,7.5)\,0+(1.0-(0))*(t-6.3)/1.2\,if(lt(t\,8.5)\,1.0+(2.3-(1.0))*(t-7.5)/1.0\,if(lt(t\,9.25)\,2.3+(3.3-(2.3))*(t-8.5)/0.75\,if(lt(t\,9.75)\,3.3+(3.6-(3.3))*(t-9.25)/0.5\,if(lt(t\,11.25)\,3.6+(3.5-(3.6))*(t-9.75)/1.5\,if(lt(t\,12.5)\,3.5+(2.6-(3.5))*(t-11.25)/1.25\,2.6))))))))*PI/180'
GRADE="huesaturation=saturation=-0.4:colors=c+b:strength=1,colorbalance=rh=0.09:gh=-0.02:bh=-0.08:rm=0.05:gm=-0.02:bm=-0.04:rs=0.02:gs=-0.01:bs=-0.01,curves=all='0/0 0.15/0.11 0.5/0.47 0.85/0.77 1/0.9'"
ffmpeg -y -i posh.4.new.mov -vf "crop=608:1080:656:0,scale=1216:2160:flags=lanczos,rotate='$ROT':ow=iw:oh=ih:bilinear=1,scale=iw*1.115:ih*1.115:flags=lanczos,crop=1216:2160,scale=1080:1920:flags=lanczos,$GRADE,unsharp=5:5:0.4" $ENC v/posh4.mp4
