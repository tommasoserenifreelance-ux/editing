"""Builds the web slideshow (web/) from the PowerPoint: slide images + video overlays (slides.json).
Needs soffice + gs. Run after build_pptx.py:  python3 build_web.py"""
import os, json, glob, shutil, subprocess, tempfile
from pptx import Presentation
HERE = os.path.dirname(os.path.abspath(__file__))
PPTX = os.path.join(HERE, 'Ossigeno-Ozono-e-longevita-Bonaccorso.pptx')
A, W = os.path.join(HERE, 'pptx_assets'), os.path.join(HERE, 'web')
vids = {os.path.getsize(f): os.path.basename(f) for f in glob.glob(os.path.join(A, '*.mp4'))}
prs = Presentation(PPTX); SW, SH = prs.slide_width, prs.slide_height
data = []
for n, sl in enumerate(prs.slides, 1):
    vs = []
    for sh in sl.shapes:
        if sh.shape_type == 16:  # MEDIA
            rid = sh._element.xpath('.//p:nvPr/a:videoFile/@r:link')[0]
            f = vids[len(sl.part.related_part(rid).blob)]
            audio = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0',
                                    os.path.join(A, f)], capture_output=True, text=True).stdout.strip()
            vs.append({'src': 'video/' + f, 'poster': 'video/' + f[:-4] + '-poster.jpg', 'auto': not audio,
                       'x': sh.left / SW, 'y': sh.top / SH, 'w': sh.width / SW, 'h': sh.height / SH})
    data.append({'img': 'slides/s%02d.jpg' % n, 'videos': vs})
os.makedirs(os.path.join(W, 'video'), exist_ok=True)
for f in set(v['src'][6:] for d in data for v in d['videos']):
    for g in (f, f[:-4] + '-poster.jpg'):
        shutil.copy(os.path.join(A, g), os.path.join(W, 'video', g))
json.dump(data, open(os.path.join(W, 'slides.json'), 'w'), indent=1)
out = os.path.join(W, 'slides'); shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
with tempfile.TemporaryDirectory() as t:
    subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', t, PPTX], check=True, capture_output=True)
    pdf = glob.glob(os.path.join(t, '*.pdf'))[0]
    subprocess.run(['gs', '-q', '-sDEVICE=png16m', '-r144', '-o', os.path.join(t, 'p%02d.png'), pdf], check=True)
    from PIL import Image
    for i, p in enumerate(sorted(glob.glob(os.path.join(t, 'p*.png'))), 1):
        Image.open(p).convert('RGB').resize((1920, 1080), Image.LANCZOS).save(os.path.join(out, 's%02d.jpg' % i), quality=88)
print(len(data), 'slides,', sum(len(d['videos']) for d in data), 'videos')
