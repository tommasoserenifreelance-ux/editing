"""Build a PDF with a carousel proposal: overview page + one page per slide,
each photo cropped to Instagram 4:5 (1080x1350).

Usage: python carousel_pdf.py slides.csv photos_dir out.pdf [--title "..."]
CSV: name,label   (in carousel order)
"""
import argparse
import csv
import os

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350          # Instagram portrait 4:5
PAGE = (1240, 1754)        # A4 at 150 dpi
BG, FG, ACC = (12, 8, 18), (240, 236, 245), (170, 90, 255)


def font(size, bold=False):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def crop45(im, top_bias=0.25):
    w, h = im.size
    th = int(w * 5 / 4)
    if th >= h:
        return im.resize((W, H), Image.LANCZOS)
    y = int((h - th) * top_bias)          # keep heads: crop more from the bottom
    return im.crop((0, y, w, y + th)).resize((W, H), Image.LANCZOS)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("csv")
    p.add_argument("photos")
    p.add_argument("out")
    p.add_argument("--title", default="Ipotesi carosello")
    args = p.parse_args()
    rows = [r for r in csv.reader(open(args.csv)) if r and not r[0].startswith("#")]
    slides = [(r[0], r[1] if len(r) > 1 else "", crop45(Image.open(os.path.join(args.photos, r[0])).convert("RGB"))) for r in rows]

    pages = []
    # overview
    pg = Image.new("RGB", PAGE, BG); d = ImageDraw.Draw(pg)
    d.text((80, 70), args.title, font=font(54, True), fill=FG)
    d.text((80, 145), f"{len(slides)} slide · formato 4:5 · ordine di pubblicazione", font=font(26), fill=(180, 170, 195))
    cols, tw = 5, 205
    th = int(tw * 5 / 4)
    gx, gy = (PAGE[0] - cols * tw - (cols - 1) * 20) // 2, 220
    for i, (n, lab, im) in enumerate(slides):
        x, y = gx + (i % cols) * (tw + 20), gy + (i // cols) * (th + 50)
        pg.paste(im.resize((tw, th), Image.LANCZOS), (x, y))
        d.text((x, y + th + 6), f"{i + 1}. {os.path.splitext(n)[0]}", font=font(18), fill=FG)
    pages.append(pg)
    # one page per slide
    for i, (n, lab, im) in enumerate(slides):
        pg = Image.new("RGB", PAGE, BG); d = ImageDraw.Draw(pg)
        s = im.resize((900, 1125), Image.LANCZOS)
        x = (PAGE[0] - 900) // 2
        pg.paste(s, (x, 220))
        d.text((x, 90), f"{i + 1}/{len(slides)}", font=font(60, True), fill=ACC)
        d.text((x + 190, 105), os.path.splitext(n)[0], font=font(38, True), fill=FG)
        if lab:
            d.text((x, 1375), lab, font=font(28), fill=(200, 190, 215))
        pages.append(pg)
    pages[0].save(args.out, save_all=True, append_images=pages[1:], resolution=150)
    print("saved", args.out, len(pages), "pages")


if __name__ == "__main__":
    main()
