# Nightlife grade – pipeline

Look approvato (DSC00618, versione **7b + grana**): color nightlife, sfondo viola
sfocato, pallini bokeh viola dietro il soggetto, grana pellicola. Pelle naturale.

## Ricetta approvata

```bash
# 1. color base (neri profondi, pelle pesca calda, ombre profonde)
python grading/nightlife_grade.py ORIG.jpg base.png
# 2. maschera soggetto (rembg / BiRefNet portrait) – calcolata in automatico se manca --mask
# 3. sfondo viola sfocato e visibile
python grading/violet_background.py base.png bg.jpg --mask mask.png --ramp violet_vivid --bg-blur 6 --lift 1.6
# 4. pallini bokeh dietro il soggetto
python grading/bokeh.py bg.jpg bokeh.jpg --mask mask.png --seed 4
# 5. grana
python grading/grain.py bokeh.jpg final.jpg --amount 0.04 --exif-from ORIG.jpg
```

## Varianti sulla stessa tonalità di viola (da alternare, non tutte su ogni foto)

| Effetto | Script |
|---|---|
| Solo sfondo viola (nitido) | `violet_background.py --ramp violet_vivid` |
| Sfondo viola sfocato | `violet_background.py --ramp violet_vivid --bg-blur 6 --lift 1.6` |
| Pallini bokeh | `bokeh.py` |
| Scia di luce (light painting) | `light_trails.py --mask assets/trail_redline.png …` |
| X / flare stella dall'alto | `star_flares.py --mask … --star x,y,len[,int]` |
| Tutto viola (wash) con pelle naturale | `color_wash.py --protect x,y,rx,ry` (labbra) |
| Pelle colorata rosa-viola | `subject_tint.py` |
| Grana | `grain.py --amount 0.04` |

Preset Lightroom: `presets/Nightlife Reference v3.xmp` (solo color base).
