// usage: node tools/render.mjs <compositionId> <out.mp4> [frame for still -> png]
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execSync } from "node:child_process";
import path from "node:path";
const [id, out, still] = process.argv.slice(2);
const browserExecutable = execSync("ls /opt/pw-browsers/chromium_headless_shell-*/*/chrome-headless-shell /opt/pw-browsers/chromium_headless_shell-*/*/headless_shell 2>/dev/null | head -1").toString().trim();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
if (still !== undefined) {
  await renderStill({ serveUrl, composition, output: out, frame: Number(still), browserExecutable });
} else {
  let last = 0;
  await renderMedia({
    serveUrl, composition, codec: "h264", outputLocation: out, browserExecutable, concurrency: 3,
    timeoutInMilliseconds: 180000, crf: 18,
    onProgress: ({ progress }) => { if (progress - last > 0.1) { last = progress; console.log(Math.round(progress * 100) + "%"); } },
  });
}
execSync(`rm -rf ${serveUrl}`);
console.log("done", out);
