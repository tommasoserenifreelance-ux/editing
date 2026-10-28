# Foto batch: editing + scritte nitide

Ogni foto editata viene ricostruita partendo dallo **scatto originale**: colori, luce
e atmosfera vengono dalla versione editata, la nitidezza (scritte comprese) dall'originale.

## Come caricare le foto

1. Metti gli scatti originali in `originali/`.
2. Metti le versioni editate in `editate/`.
3. **Ogni coppia deve avere lo stesso nome** (l'estensione può cambiare):

```
originali/gallo-nero.jpg   <->   editate/gallo-nero.webp
originali/IMG_0421.jpg     <->   editate/IMG_0421.jpg
```

Formati accettati: jpg, jpeg, png, webp, tif. Massimo 25 MB per file e 100 file per caricamento dal sito GitHub.

## Risultati

Finiscono in `risultati/` con lo stesso nome (`NOME.jpg`, e `NOME_x4.jpg` se si chiede l'upscaling).

```bash
python3 process.py            # solo correzione
python3 process.py --upscale  # correzione + versione x4
```
