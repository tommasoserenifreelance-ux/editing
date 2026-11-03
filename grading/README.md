# Nightlife grade

Look da foto in discoteca (neri profondi e caldi, alte luci crema, pelle dorata e luminosa,
luci del locale sature, clarity leggera, vignettatura). Mantiene la risoluzione originale
ed esporta JPEG qualità 100 senza sottocampionamento colore (4:4:4), conservando il profilo ICC.

```bash
pip install numpy pillow
python grading/nightlife_grade.py input.jpg output.jpg            # look pieno
python grading/nightlife_grade.py input.jpg output.jpg --strength 0.7  # più leggero
```
Per output senza perdita usa un nome `.png` o `.tif`.
