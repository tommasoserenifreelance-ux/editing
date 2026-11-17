"""Cut Elena out of the green screen clip, one frame per call.

The cloth only covers part of the frame (floor and room show around her),
so a chroma key is not enough: this uses rembg's birefnet-portrait model
(weights only, MIT). It needs a lot of memory, so call it in a loop, one
frame per process:  while python3 scripts/elena-matte.py WORKDIR; do :; done
WORKDIR/frames/*.png in, WORKDIR/mask/*.png out. Exits 1 when all are done.
"""

import glob
import os
import sys

from PIL import Image
from rembg import new_session, remove

work = sys.argv[1]
os.makedirs(f"{work}/mask", exist_ok=True)
todo = [
    f
    for f in sorted(glob.glob(f"{work}/frames/*.png"))
    if not os.path.exists(f"{work}/mask/" + os.path.basename(f))
]
if not todo:
    sys.exit(1)
sess = new_session("birefnet-portrait")
remove(Image.open(todo[0]), session=sess, only_mask=True).save(
    f"{work}/mask/" + os.path.basename(todo[0])
)
