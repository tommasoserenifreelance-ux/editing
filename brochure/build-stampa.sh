#!/bin/sh
# Rigenera anteprima e PDF di stampa CMYK (A4 + 3 mm abbondanza, testi in tracciati).
set -e
cd "$(dirname "$0")"
node render.js
gs -q -dNOPAUSE -dBATCH -dSAFER -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
  -sColorConversionStrategy=CMYK -sProcessColorModel=DeviceCMYK -dOverrideICC \
  -dPDFSETTINGS=/prepress -dDownsampleColorImages=false -dDownsampleGrayImages=false \
  -dAutoFilterColorImages=false -dColorImageFilter=/DCTEncode -dJPEGQ=95 \
  -dNoOutputFonts \
  -sOutputFile=brochure-studio-bonaccorso-STAMPA-CMYK.pdf stampa-rgb.pdf
rm stampa-rgb.pdf
