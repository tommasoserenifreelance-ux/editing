// Storia dell'ozono in medicina — Archive Light Table. render(t) for the whole film.
// Eight prints from the presentation lie on a cool backlit table as transparencies, two rows in date order.
// One continuous camera; a loupe lands on each print. On the four turning points the camera falls into the lens.
// World units = atlas pixels (each print 1460 × 1000). Picture: one WebGL2 shader; marks and captions on a 2D canvas.
import { EVENTS, PRINTS, CUES, LIGHT_ON, PULL, INDEX, ENDCARD, DUR } from './timeline.js';

const W = 1920, H = 1080;
const BLUE = '#2fa8dc', INK = '#0f2a3d', PLATE = 'rgba(12,30,44,';

// ---------------- helpers ----------------
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ss = x => x * x * (3 - 2 * x);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eo = x => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, x) => a + (b - a) * x;
function track(keys) {                              // monotone cubic (Fritsch–Carlson), [t, v]
  const n = keys.length, d = [], m = [];
  for (let i = 0; i < n - 1; i++) d.push((keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]));
  for (let i = 0; i < n; i++) m.push(i === 0 || i === n - 1 ? 0 : (d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return t => {
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (t > keys[i + 1][0]) i++;
    const h = keys[i + 1][0] - keys[i][0], u = (t - keys[i][0]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * keys[i][1] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * keys[i + 1][1] + (u3 - u2) * h * m[i + 1];
  };
}
const track2 = keys => { const x = track(keys.map(k => [k[0], k[1][0]])), y = track(keys.map(k => [k[0], k[1][1]])); return t => [x(t), y(t)]; };
const rot = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [c * v[0] - s * v[1], s * v[0] + c * v[1]]; };

// ---------------- the table ----------------
const PW = 1460, PH = 1000, GX = 1760, GY = 1420;
const ROT = [-2.2, 1.4, -1.0, 2.4, 1.8, -1.6, 2.0, -1.2];
const DY = [0, 60, -40, 30, -30, 40, -20, 50];
const IT = PRINTS.map((p, i) => ({ c: [(i % 4) * GX, Math.floor(i / 4) * GY + DY[i]], r: ROT[i] * Math.PI / 180 }));
const TABLE_C = [1.5 * GX, 0.5 * GY];
const TAB_LO = [-1350, -1250], TAB_HI = [3 * GX + 1350, GY + 1300];
const toW = (it, p) => { const o = rot(p, it.r); return [it.c[0] + o[0], it.c[1] + o[1]]; };   // p: print-local (centre origin)

// where the loupe sits on each print (print-local): the face or the title
const LP = [[-120, -90], [10, -150], [120, -40], [0, -120], [0, -260], [80, -60], [-10, -60], [-60, 40]];
const LENS_RW = 560, MAG = 2.5;
// where each slow push drifts to while we are inside the print (print-local)
const KB = [[-90, -40], [20, -80], [90, -10], [10, -60], [-20, -170], [60, -30], [-40, -10], [-30, 30]];
const LW = IT.map((it, i) => toW(it, LP[i]));

// ---------------- camera ----------------
const Z_TAB = 0.46, Z_PUSH = 2.0, Z_WIDE = 0.235, Z_END = 0.215;
const CAM = [[0, [TABLE_C[0] - 900, TABLE_C[1] + 200], 0.17, -2.5], [LIGHT_ON + 0.4, [TABLE_C[0] - 400, TABLE_C[1]], 0.205, -1.2], [EVENTS[0].drop - 1.1, [TABLE_C[0], TABLE_C[1]], Z_WIDE, 0]];
EVENTS.forEach((e, i) => {
  const lw = LW[i], off = [140, 90];
  CAM.push([e.drop, [lw[0] + off[0], lw[1] + off[1]], Z_TAB, ROT[i] * 0.4]);
  if (e.push) {
    CAM.push([e.drop + 1.0, lw, Z_PUSH, ROT[i] * 0.4]);
    CAM.push([e.lift - 0.95, lw, Z_PUSH, ROT[i] * 0.4]);
    CAM.push([e.lift, [lw[0] + off[0], lw[1] + off[1]], Z_TAB, ROT[i] * 0.4]);
  } else {
    CAM.push([e.lift, [lw[0] + off[0] - 40, lw[1] + off[1] - 30], Z_TAB * 1.12, ROT[i] * 0.4]);
  }
});
CAM.push([PULL + 0.4, [LW[7][0] - 300, LW[7][1] - 200], 0.36, -0.4]);
CAM.push([INDEX + 1.6, [TABLE_C[0] + 1500, TABLE_C[1] + 250], Z_END, 0]);
CAM.push([DUR, [TABLE_C[0] + 1560, TABLE_C[1] + 250], Z_END * 0.97, 0]);
const camC = track2(CAM.map(k => [k[0], k[1]]));
const camLZ = track(CAM.map(k => [k[0], Math.log(k[2])]));
const camR = track(CAM.map(k => [k[0], k[3]]));
const camAt = t => ({ c: camC(t), z: Math.exp(camLZ(t)), th: camR(t) * Math.PI / 180 });
function w2s(w, cam) { const d = rot([(w[0] - cam.c[0]) * cam.z, (w[1] - cam.c[1]) * cam.z], cam.th); return [W / 2 + d[0], H / 2 + d[1]]; }

// ---------------- the dives ----------------
// inside the lens: scale S (px per world unit) and centre ic, from the physical loupe (S = z × 2.5) to the target and back
const DIVES = EVENTS.map((e, i) => {
  const lw = LW[i], s0 = camAt(e.drop).z * MAG, s1 = camAt(e.lift).z * MAG;
  const S = e.push
    ? track([[e.drop, s0], [e.drop + 1.0, 0.92], [e.lift - 0.95, 1.16], [e.lift, s1]])
    : track([[e.drop, s0], [e.lift, s1]]);
  const C = e.push
    ? track2([[e.drop, lw], [e.drop + 1.0, IT[i].c], [e.lift - 0.95, toW(IT[i], KB[i])], [e.lift, lw]])
    : track2([[e.drop, lw], [e.lift, lw]]);
  return { e, i, lw, S, C };
});

function shot(t) {
  const cam = camAt(t);
  let dv = null; for (const d of DIVES) if (t >= d.e.drop - 0.4 && t <= d.e.lift + 0.4) dv = d;
  const st = { cam, t, on: 0, A: 0, lift: 1, ls: [0, 0], R: 0, S: 1, ic: [0, 0], k: 0.16, enter: 0, dive: dv };
  if (dv) {
    const e = dv.e, inn = seg(t, e.drop - 0.4, e.drop), out = seg(t, e.lift, e.lift + 0.4);
    st.on = 1; st.A = eo(inn) * (1 - ss(out)); st.lift = 1 + 0.35 * (1 - eo(inn)) + 0.35 * eo(out);
    st.ls = w2s(dv.lw, cam); st.R = LENS_RW * cam.z * st.lift;
    const tt = clamp(t, e.drop, e.lift);
    st.S = dv.S(tt); st.ic = dv.C(tt);
    if (t < e.drop || t > e.lift) st.S = cam.z * MAG * st.lift;
    if (e.push) {
      st.k = 0.16 * (1 - ss(seg(t, e.drop + 0.2, e.drop + 0.95))) + 0.16 * ss(seg(t, e.lift - 0.7, e.lift));
      st.enter = ss(seg(t, e.drop + 0.3, e.drop + 1.0)) * (1 - ss(seg(t, e.lift - 0.95, e.lift - 0.3)));
    }
  }
  return st;
}
function int2s(w, st) { const q = [(w[0] - st.ic[0]) * st.S, (w[1] - st.ic[1]) * st.S]; const r = rot(q, st.cam.th); return [st.ls[0] + r[0], st.ls[1] + r[1]]; }


// ---------------- the photograph comes alive ----------------
// per print: does it have a cut-out subject, where the subject's feet are (it grows from there), how it drifts, how the background slides
const LAYERS = [
  { on: 1, c: [-150, 500], sub: [70, -10], par: [-60, 0], k: 1.07 },      // 1839 Schönbein leans over his bench
  { on: 1, c: [0, 500], sub: [-40, 0], par: [70, 10], k: 1.06 },          // 1857 Siemens
  { on: 0 },                                                                // 1870 the patient (soft cut-out: Ken Burns only)
  { on: 1, c: [0, 500], sub: [0, -10], par: [0, 30], k: 1.08 },           // 1881 Kellogg's portrait
  { on: 0 },                                                                // 1885 the book
  { on: 0 },                                                                // 1886 the field tent (soft cut-out: Ken Burns only)
  { on: 1, c: [100, 500], sub: [30, 0], par: [-40, 0], k: 1.06 },         // 1900 Tesla at the generator
  { on: 0 },                                                                // 1990–2000 title card
];
function layerAt(st, t) {
  const off = { on: 0, par: [0, 0], sub: [0, 0], c: [0, 0], k: 1, p: 0 };
  if (!st.dive || !st.dive.e.push || st.enter <= 0) return off;
  const L = LAYERS[st.dive.i]; if (!L.on) return off;
  const e = st.dive.e, p = ss(seg(t, e.drop + 0.6, e.lift - 0.4)) * st.enter;
  const breath = 1 + 0.004 * Math.sin((t - e.drop) * 2 * Math.PI * 0.35);
  return { on: 1, p, par: [L.par[0] * p, L.par[1] * p], sub: [L.sub[0] * p, L.sub[1] * p], c: L.c, k: (1 + (L.k - 1) * p) * breath };
}

// ---------------- WebGL ----------------
const cv = document.getElementById('gl');
const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
const ov = document.getElementById('ov').getContext('2d');
let ATLAS = [];
const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
const FS = () => `#version 300 es
precision highp float;
uniform sampler2D tA, tB, tS;
uniform vec4 uIt[8];        // centre.xy, rotation, unused
uniform vec4 uUV[8];        // atlas rect u0 v0 u1 v1
uniform vec2 uCam; uniform float uZ, uRot, uT, uLight;
uniform vec2 uLensC; uniform float uLensR, uLensOn, uLensA, uLift;
uniform vec2 uIntC; uniform float uS, uK, uEnter, uFocus, uDimOthers;
uniform vec2 uPar, uSub, uSubC; uniform float uSubK, uLayer, uLP;
out vec4 o;
const vec2 PS = vec2(${PW / 2}., ${PH / 2}.);
float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
vec2 rot(vec2 v, float a){ float c=cos(a), s=sin(a); return vec2(c*v.x-s*v.y, s*v.x+c*v.y); }
vec3 lightTable(vec2 w){
  vec2 lo = vec2(${TAB_LO[0]}., ${TAB_LO[1]}.), hi = vec2(${TAB_HI[0]}., ${TAB_HI[1]}.);
  vec2 d = min(w - lo, hi - w); float e = min(d.x, d.y);
  vec2 cd = (w - vec2(${TABLE_C[0]}., ${TABLE_C[1]}.)) / vec2(9000., 5200.);
  float L = (1. - 0.12*dot(cd, cd)) + (vn(w*0.015) - 0.5)*0.010 + (vn(w*0.0021) - 0.5)*0.012;
  vec3 lit = vec3(0.962, 0.975, 0.990)*L*uLight + vec3(0.030, 0.034, 0.040)*(1. - uLight);
  vec3 frame = vec3(0.34, 0.35, 0.37) + 0.05*vn(vec2(w.x*0.002, w.y*0.4)) - 0.14*smoothstep(0., 160., e + 160.);
  vec3 desk = vec3(0.045, 0.055, 0.068) + 0.012*vn(w*0.003);
  return e > 0. ? lit : (e > -160. ? frame : desk);
}
// a print as a backlit transparency in a thin white mount
vec3 slide(vec3 L, vec2 w, vec4 it, vec4 uv, float fp, float dim, inout bool hit, bool layered){
  vec2 p = rot(w - it.xy, -it.z);
  vec2 q = abs(p) - PS;
  float mount = 46.;
  if (max(q.x, q.y) > mount) return L;
  hit = true;
  // soft shadow edge of the mount on the glass
  if (max(q.x, q.y) > 0.){
    float m = 0.80 + 0.06*vn(p*0.05);
    return L*vec3(m*1.0, m*1.0, m*0.99) * (1. - 0.18*smoothstep(mount - 10., mount, max(q.x, q.y)));
  }
  vec2 sz = vec2(textureSize(tA, 0)); vec2 f = vec2(fp)/sz;
  vec3 c;
  if (layered){
    // into the photograph: the filled background slides one way, the cut-out subject drifts and grows the other
    vec2 pb = clamp(p - uPar, -PS, PS);
    vec2 buv = mix(uv.xy, uv.zw, (pb + PS)/(2.*PS));
    vec3 orig = textureGrad(tA, buv, vec2(f.x, 0.), vec2(0., f.y)).rgb;
    vec3 fillc = textureGrad(tB, buv, vec2(f.x, 0.), vec2(0., f.y)).rgb;
    float ha = textureGrad(tS, buv, vec2(f.x, 0.), vec2(0., f.y)).a;
    c = mix(orig, fillc, smoothstep(0.02, 0.35, ha) * clamp(uLP * 5., 0., 1.));   // the fill where the subject used to stand, once it has moved
    vec2 ps = (p - uSubC - uSub)/uSubK + uSubC;
    if (abs(ps.x) < PS.x && abs(ps.y) < PS.y){
      vec2 suv = mix(uv.xy, uv.zw, (ps + PS)/(2.*PS));
      vec4 sc4 = textureGrad(tS, suv, vec2(f.x, 0.), vec2(0., f.y));
      c = mix(c, sc4.rgb, sc4.a);
    }
  } else {
    vec2 tuv = mix(uv.xy, uv.zw, (p + PS)/(2.*PS));
    c = textureGrad(tA, tuv, vec2(f.x, 0.), vec2(0., f.y)).rgb;
  }
  c = pow(c, vec3(1.05));
  vec3 col = L*c*1.02 + vec3(0.015)*(1. - uLight);
  float vig = 1. - 0.10*pow(length(p/PS), 3.);
  return col * vig * (1. - dim);
}
float speck(vec2 p, float cell, float thr){
  vec2 g = floor(p/cell), f = p/cell - g;
  if (h21(g) < thr) return 0.;
  vec2 c = vec2(.2) + .6*vec2(h21(g+3.1), h21(g+7.7)); float r = .05 + .12*h21(g+1.3);
  return smoothstep(r, r*.35, length(f - c));
}
vec3 scene(vec2 w, bool interior, float fp){
  vec3 L = lightTable(w), col = L; bool hit = false;
  for (int i = 0; i < 8; i++){
    float dim = (float(i) == uFocus) ? 0. : uDimOthers;
    bool lay = interior && uLayer > 0.5 && float(i) == uFocus;
    vec3 c = slide(L, w, uIt[i], uUV[i], fp, dim, hit, lay);
    if (hit){ col = c; break; }
  }
  float dd = speck(w, 70., 0.955)*0.5 + speck(w + 31., 19., 0.975)*0.35;
  col *= 1. - dd*(interior ? (1. - uEnter) : 0.8)*0.5;
  return col;
}
void main(){
  vec2 s = vec2(gl_FragCoord.x, 1080. - gl_FragCoord.y);
  vec2 w = uCam + rot(s - vec2(960., 540.), -uRot) / uZ;
  vec2 dl = s - uLensC; float r = length(dl), rho = r / max(uLensR, 1.);
  vec3 table = scene(w, false, 1. / uZ);
  vec3 col = table;
  if (uLensOn > .5){
    vec2 sd = s - (uLensC + vec2(26., 34.)*(uLift - 1.)*uLensR/120.);
    float sr = length(sd)/uLensR;
    vec3 under = table * (1. - 0.22*(uLift - 1.)/0.35*uLensA*smoothstep(1.55, 1.05, sr));
    vec3 lc;
    if (rho < 1.0){
      vec3 c3;
      for (int i=0;i<3;i++){
        float k = uK*(1. + float(i-1)*0.10);
        vec2 q = dl / (1. + k*rho*rho) * (1. - float(i-1)*0.004*uK/0.16);
        vec2 wi = uIntC + rot(q, -uRot) / uS;
        c3[i] = scene(wi, true, 1. / uS)[i];
      }
      lc = c3;
      lc *= 1. - 0.30*smoothstep(0.78, 1.0, rho)*(1. - uEnter);
      vec2 hp = dl/uLensR - vec2(-0.38, -0.46); lc += vec3(0.06)*exp(-dot(hp,hp)*7.)*(1. - uEnter);
      vec2 hp2 = dl/uLensR - vec2(0.42, 0.50); lc += vec3(0.025)*exp(-dot(hp2,hp2)*14.)*(1. - uEnter);
    } else if (rho < 1.065){
      float u = (rho - 1.0)/0.065; vec2 nd = dl / max(r, 1.);
      float lit = max(0., dot(nd, normalize(vec2(-0.55, -0.83))));
      float bev = exp(-pow((u - 0.18)/0.09, 2.))*0.9 + exp(-pow((u - 0.85)/0.07, 2.))*0.5;
      lc = vec3(0.040, 0.044, 0.050) + vec3(0.62, 0.64, 0.68)*pow(lit, 5.)*bev + 0.05*bev + vn(vec2(atan(dl.y, dl.x)*180., u*4.))*0.02;
    } else if (rho < 1.30){
      float u = (rho - 1.065)/0.235;
      vec2 s2 = uLensC + dl*(0.955 + 0.045*u);
      vec2 w2 = uCam + rot(s2 - vec2(960., 540.), -uRot) / uZ;
      lc = scene(w2, false, 1. / uZ)*0.93 + 0.035*uLight;
      lc *= 1. - 0.45*exp(-pow(u/0.05, 2.));
      lc += vec3(0.20, 0.21, 0.23)*exp(-pow((u - 0.93)/0.035, 2.))*uLight;
      lc *= 1. - 0.25*exp(-pow((u - 1.0)/0.015, 2.));
    } else {
      lc = under * (1. - (0.07*exp(-pow((rho - 1.31)/0.05, 2.)) + 0.03*exp(-pow((rho - 1.3)/0.25, 2.)))*(2. - uLift));
    }
    col = mix(under, lc, uLensA);
  }
  vec2 sv = (s - vec2(960., 540.)) / vec2(1100., 760.);
  col *= 1. - 0.09*dot(sv, sv);
  float g = h21(s + fract(uT*24.*0.6180339)*vec2(311.7, 217.3)) - 0.5;
  col += g*(0.016 + 0.012*uEnter);
  o = vec4(clamp(col, 0., 1.), 1.);
}`;
function shd(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
let prog;
const U = n => gl.getUniformLocation(prog, n);
function initGL() {
  prog = gl.createProgram();
  gl.attachShader(prog, shd(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, shd(gl.FRAGMENT_SHADER, FS())); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
}
function tex(unit, src) {
  const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const ext = gl.getExtension('EXT_texture_filter_anisotropic'); if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
}
const img = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('missing ' + src)); i.src = src; });

// ---------------- overlay ----------------
let TXT = [];
function text(c, id, s, x, y, font, color, opt = {}) {
  c.font = font; c.fillStyle = color; c.textBaseline = 'alphabetic'; c.textAlign = opt.align || 'left';
  c.fillText(s, x, y);
  if (id && c.globalAlpha > 0.6) {
    const m = c.measureText(s), wdt = m.width, x0 = opt.align === 'right' ? x - wdt : opt.align === 'center' ? x - wdt / 2 : x;
    const tf = c.getTransform(), p0 = tf.transformPoint({ x: x0, y: y - m.actualBoundingBoxAscent }), p1 = tf.transformPoint({ x: x0 + wdt, y: y + m.actualBoundingBoxDescent });
    TXT.push({ id, text: s, pass: !!opt.pass, x0: Math.min(p0.x, p1.x), y0: Math.min(p0.y, p1.y), x1: Math.max(p0.x, p1.x), y1: Math.max(p0.y, p1.y) });
  }
  c.textAlign = 'left';
}
function wipe(c, x, y, w, h, k) { c.beginPath(); c.rect(x, y, w * k, h); c.clip(); }
function ring(c, p, r, k, lw = 2.4, col = BLUE) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(p[0], p[1], r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke(); }
function dot(c, p, r = 3.5, col = BLUE) { c.fillStyle = col; c.beginPath(); c.arc(p[0], p[1], r, 0, Math.PI * 2); c.fill(); }
function plate(c, x, y, w, h, a = 0.9) { c.fillStyle = `${PLATE}${0.80 * a})`; c.beginPath(); c.roundRect(x, y, w, h, 4); c.fill(); }

const NOSUBS = /nosubs=1/.test(location.search);
function subtitles(c, t) {
  if (NOSUBS) return;
  for (const q of CUES) {
    if (t < q.t0 || t >= q.t1) continue;
    const a = Math.min(seg(t, q.t0, q.t0 + 0.12), 1 - seg(t, q.t1 - 0.12, q.t1));
    c.save(); c.globalAlpha = a;
    c.font = '500 34px MS'; const wm = c.measureText(q.text).width + 64, x0 = (W - wm) / 2, y0 = 960;
    plate(c, x0, y0, wm, 70, 1.05);
    c.fillStyle = BLUE; c.fillRect(x0, y0, 3, 70);
    text(c, null, q.text, W / 2, y0 + 46, '500 34px MS', 'rgba(250,251,253,0.98)', { align: 'center' });
    c.restore();
  }
}

// tags under every print, kept on the table (hidden under the loupe)
function tableTags(c, t, st) {
  const cam = st.cam;
  IT.forEach((it, i) => {
    const p0 = 0.3 + i * 0.12;
    const a = eo(seg(t, LIGHT_ON + p0, LIGHT_ON + p0 + 0.5)) * (1 - seg(t, INDEX + 0.1 + i * 0.12, INDEX + 0.4 + i * 0.12));
    if (a <= 0) return;
    const p = w2s(toW(it, [-PW / 2, PH / 2 + 130]), cam);
    c.save(); c.translate(p[0], p[1]); c.rotate(cam.th + it.r);
    const sc = clamp(cam.z / 0.46, 0.5, 1.5); c.scale(sc, sc); c.globalAlpha = a;
    text(c, null, PRINTS[i].year, 0, 0, '500 30px PM', BLUE);
    c.font = '500 30px PM'; const wy = c.measureText(PRINTS[i].year).width;
    text(c, null, PRINTS[i].title, wy + 20, -1, '500 26px MS', INK);
    c.restore();
  });
}

// the reading card for the event in progress: screen-fixed, top left, joined to the loupe by a leader
function readingCard(c, t, st) {
  const dv = st.dive; if (!dv) return;
  const e = dv.e, P = PRINTS[dv.i];
  const k = eo(seg(t, e.t0 + 0.1, e.t0 + 0.6)) * (1 - seg(t, e.lift - 0.35, e.lift));
  if (k <= 0) return;
  const x = 96, y = 96, cw = 640, ch = 210;
  c.save(); c.globalAlpha = k;
  // leader from the lens rim to the card (only while the loupe sits on the table)
  if (!e.push || st.enter < 0.5) {
    const ang = Math.atan2(y + ch - st.ls[1], x + cw * 0.6 - st.ls[0]);
    const a = [st.ls[0] + Math.cos(ang) * st.R * 1.32, st.ls[1] + Math.sin(ang) * st.R * 1.32];
    const lk = eo(seg(t, e.t0, e.t0 + 0.4));
    c.strokeStyle = BLUE; c.lineWidth = 2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(lerp(a[0], x + cw * 0.6, lk), lerp(a[1], y + ch, lk)); c.stroke();
    dot(c, a, 4);
  }
  c.save(); wipe(c, x - 4, y - 4, cw + 8, ch + 8, eo(seg(t, e.t0 + 0.15, e.t0 + 0.7)));
  plate(c, x, y, cw, ch, 1.05);
  c.fillStyle = BLUE; c.fillRect(x, y, 3, ch);
  text(c, 'yr' + dv.i, P.year, x + 32, y + 104, `500 ${P.year.length > 4 ? 72 : 88}px PM`, BLUE);
  text(c, 'ti' + dv.i, P.title, x + 34, y + 150, '600 32px MS', 'rgba(250,251,253,0.98)');
  text(c, 'su' + dv.i, P.sub, x + 34, y + 186, '400 22px MS', 'rgba(250,251,253,0.72)');
  c.restore();
  c.restore();
}

// index: every tag flies into one list; then the closing card
function indexPanel(c, t, st) {
  const x0 = 1180, y0 = 96, rw = 640, rh = 80;
  const pa = eo(seg(t, INDEX, INDEX + 0.5));
  if (pa <= 0) return;
  const arrived = PRINTS.reduce((acc, r, i) => acc + eio(seg(t, INDEX + 0.15 + i * 0.12, INDEX + 0.6 + i * 0.12)), 0);
  c.save(); c.globalAlpha = pa;
  plate(c, x0 - 32, y0 - 34, rw + 64, 84 + arrived * rh + 20 * Math.min(1, arrived), 1.15);
  text(c, 'ix-h', 'Ossigeno-ozono in medicina', x0, y0 + 22, '600 36px CG', 'rgba(250,251,253,0.98)');
  c.restore();
  PRINTS.forEach((r, i) => {
    const t0 = INDEX + 0.15 + i * 0.12, k = eio(seg(t, t0, t0 + 0.45)); if (k <= 0) return;
    const from = w2s(toW(IT[i], [-PW / 2, PH / 2 + 130]), st.cam), to = [x0, y0 + 84 + i * rh];
    const p = [lerp(from[0], to[0], k), lerp(from[1], to[1], k)], done = k >= 1;
    c.save(); c.globalAlpha = Math.min(1, k * 2) * pa;
    c.strokeStyle = 'rgba(250,251,253,0.16)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, to[1] - 30); c.lineTo(x0 + rw, to[1] - 30); c.stroke();
    text(c, done ? `ix${i}a` : null, r.year, p[0], p[1] + 10, '500 28px PM', BLUE);
    text(c, done ? `ix${i}b` : null, r.title, p[0] + 170, p[1] + 8, '500 26px MS', 'rgba(250,251,253,0.97)');
    text(c, done ? `ix${i}c` : null, r.sub, p[0] + 170, p[1] + 36, '400 19px MS', 'rgba(250,251,253,0.6)');
    c.restore();
  });
}
function endCard(c, t) {
  const k = eo(seg(t, ENDCARD, ENDCARD + 0.6)); if (k <= 0) return;
  const x = 100, y = 740;
  c.save(); c.globalAlpha = k; wipe(c, x - 40, y - 110, 900, 240, k);
  plate(c, x - 34, y - 100, 860, 214, 1.15);
  text(c, 'end-a', 'Ossigeno-ozono', x, y - 10, '600 70px CG', 'rgba(250,251,253,0.98)');
  text(c, 'end-b', 'dalla scoperta ai protocolli', x, y + 40, '500 40px CGI', 'rgba(250,251,253,0.9)');
  c.fillStyle = BLUE; c.fillRect(x, y + 64, 780, 2);
  text(c, 'end-c', '1839 → oggi', x, y + 100, '500 24px PM', BLUE);
  c.restore();
}


// ---------------- life inside each print ----------------
// deterministic hash noise
const hsh = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// what moves in each scene (print-local anchors): bubbles = ozone rising in water; arc = electric discharge; glow = a lamp breathing;
// mist = air drifting through the light; scan = the reading line over a document
const LIFE = [
  { kind: ['bubbles', 'glow'], at: [-260, 160], glowAt: [-300, -200] },          // 1839 electrolysis
  { kind: ['arc', 'glow'], at: [470, -230], glowAt: [470, -230] },                // 1857 generator
  { kind: ['glow', 'mist'], glowAt: [180, -260] },                                // 1870 blood in a tube
  { kind: ['mist'] },                                                              // 1881 disinfectant
  { kind: ['scan'] },                                                              // 1885 the book
  { kind: ['mist', 'glow'], glowAt: [-200, -250] },                                // 1886 wounds
  { kind: ['arc', 'glow'], at: [560, 40], glowAt: [560, 40] },                  // 1900 Tesla
  { kind: ['bubbles'], at: [0, 520] },                                             // 1990–2000
];
function sceneLife(c, t, st) {
  const i = st.dive.i, it = IT[i], L = LIFE[i], e = st.dive.e;
  const a = st.enter, lt = t - (e.drop + 1.0);
  const P = q => int2s(toW(it, q), st);
  const corners = [[-PW / 2, -PH / 2], [PW / 2, -PH / 2], [PW / 2, PH / 2], [-PW / 2, PH / 2]].map(P);
  c.save(); c.globalAlpha = a;
  c.beginPath(); corners.forEach((p, j) => j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.clip();
  const sc = st.S;
  if (L.kind.includes('glow')) {
    const g = P(L.glowAt), pulse = 0.55 + 0.25 * Math.sin(lt * 2.1 + i) + 0.12 * Math.sin(lt * 5.3 + i * 2);
    const r = 380 * sc, gr = c.createRadialGradient(g[0], g[1], 0, g[0], g[1], r);
    gr.addColorStop(0, `rgba(255,236,200,${0.30 * pulse})`); gr.addColorStop(1, 'rgba(255,236,200,0)');
    c.globalCompositeOperation = 'screen'; c.fillStyle = gr; c.fillRect(g[0] - r, g[1] - r, 2 * r, 2 * r); c.globalCompositeOperation = 'source-over';
  }
  if (L.kind.includes('mist')) {
    c.globalCompositeOperation = 'screen';
    for (let k = 0; k < 7; k++) {
      const x = -PW / 2 + ((hsh(k + i * 13) * PW + lt * (28 + 22 * hsh(k + 5))) % (PW + 400)) - 200, y = -PH / 2 + hsh(k * 3 + i) * PH;
      const p = P([x, y]), r = (220 + 200 * hsh(k * 7)) * sc;
      const gr = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
      gr.addColorStop(0, 'rgba(225,238,248,0.26)'); gr.addColorStop(1, 'rgba(225,238,248,0)');
      c.fillStyle = gr; c.fillRect(p[0] - r, p[1] - r, 2 * r, 2 * r);
    }
    c.globalCompositeOperation = 'source-over';
  }
  if (L.kind.includes('bubbles')) {
    for (let k = 0; k < 46; k++) {
      const speed = 70 + 90 * hsh(k + 1.3), life = (PH * 0.9) / speed, ph = (lt + hsh(k + 9.1) * life) % life;
      const x0 = L.at[0] + (hsh(k + 2.2) - 0.5) * PW * 0.9, y = L.at[1] - ph * speed;
      const x = x0 + 14 * Math.sin(ph * 2.4 + k);
      if (y < -PH / 2 + 10) continue;
      const p = P([x, y]), r = (6 + 18 * hsh(k + 4.4)) * sc, fade = Math.min(1, ph * 2) * Math.min(1, (y + PH / 2) / 160);
      c.globalAlpha = a * fade;
      const gr = c.createRadialGradient(p[0] - r * 0.3, p[1] - r * 0.35, r * 0.1, p[0], p[1], r);
      gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(0.55, 'rgba(200,232,250,0.12)'); gr.addColorStop(0.9, 'rgba(160,215,245,0.55)'); gr.addColorStop(1, 'rgba(190,160,240,0)');
      c.fillStyle = gr; c.beginPath(); c.arc(p[0], p[1], r, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = a;
  }
  if (L.kind.includes('arc')) {
    const o = P(L.at), base = 300 * sc;
    const beat = Math.floor(lt * 12);                       // new discharge shape twelve times a second
    const on = hsh(beat + i * 7) > 0.35 ? 1 : 0.25;
    c.globalCompositeOperation = 'screen';
    const gr = c.createRadialGradient(o[0], o[1], 0, o[0], o[1], base * 2.2);
    gr.addColorStop(0, `rgba(150,215,255,${0.45 * on})`); gr.addColorStop(1, 'rgba(150,215,255,0)');
    c.fillStyle = gr; c.fillRect(o[0] - base * 2.2, o[1] - base * 2.2, base * 4.4, base * 4.4);
    for (let b = 0; b < 6; b++) {
      let ang = hsh(beat * 4 + b) * Math.PI * 2, x = o[0], y = o[1];
      c.strokeStyle = `rgba(225,245,255,${0.95 * on})`; c.lineWidth = 3.2; c.shadowColor = 'rgba(120,200,255,0.9)'; c.shadowBlur = 14;
      c.beginPath(); c.moveTo(x, y);
      for (let sgm = 0; sgm < 7; sgm++) { ang += (hsh(beat * 31 + b * 7 + sgm) - 0.5) * 1.3; const l = base * (0.18 + 0.12 * hsh(sgm + b + beat)); x += Math.cos(ang) * l; y += Math.sin(ang) * l; c.lineTo(x, y); }
      c.stroke();
    }
    c.shadowBlur = 0; c.globalCompositeOperation = 'source-over';
  }
  if (L.kind.includes('scan')) {
    // the title line of the document lights up and an underline draws under it
    const y = -PH / 2 + 95, k = eio(seg(t, e.t0 + 0.8, e.t0 + 2.0));
    const a0 = P([-260, y]), a1 = P([lerp(-260, 260, k), y]);
    c.strokeStyle = BLUE; c.lineWidth = 4; c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.stroke();
    // a reading band sliding down the page
    const yy = -PH / 2 + 180 + ((lt * 60) % (PH - 260)), b0 = P([-PW / 2 + 140, yy - 16]), b1 = P([PW / 2 - 140, yy + 16]);
    c.fillStyle = 'rgba(47,168,220,0.10)'; c.fillRect(Math.min(b0[0], b1[0]), Math.min(b0[1], b1[1]), Math.abs(b1[0] - b0[0]), Math.abs(b1[1] - b0[1]));
  }
  c.restore();
}

function overlay(t, st) {
  const c = ov; TXT = [];
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  if (t < LIGHT_ON) { subtitles(c, t); return; }
  c.save();
  if (st.on && st.A > 0.5) { c.beginPath(); c.rect(0, 0, W, H); c.arc(st.ls[0], st.ls[1], st.R * 1.31, 0, Math.PI * 2, true); c.clip('evenodd'); }
  tableTags(c, t, st);
  // a ring stays on every print already seen
  EVENTS.forEach((e, i) => {
    if (t < e.lift || t > INDEX + 0.4) return;
    const k = eo(seg(t, e.lift, e.lift + 0.4)), p = w2s(LW[i], st.cam);
    c.save(); c.globalAlpha = 0.85; ring(c, p, Math.max(10, 70 * st.cam.z), k, 2.2); c.restore();
  });
  c.restore();
  // crop corners inside the lens while the camera falls into a print
  if (st.dive && st.dive.e.push && st.enter > 0.05) {
    const it = IT[st.dive.i], a = st.enter * (1 - seg(t, st.dive.e.lift - 0.9, st.dive.e.lift - 0.5));
    const cs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => int2s(toW(it, [sx * (PW / 2 - 30), sy * (PH / 2 - 30)]), st));
    c.save(); c.globalAlpha = a; c.strokeStyle = BLUE; c.lineWidth = 3;
    const L = 70 * eio(st.enter);
    cs.forEach((p, j) => { const sx = j % 2 ? -1 : 1, sy = j > 1 ? -1 : 1; c.beginPath(); c.moveTo(p[0] + sx * L, p[1]); c.lineTo(p[0], p[1]); c.lineTo(p[0], p[1] + sy * L); c.stroke(); });
    c.restore();
  }
  if (st.dive && st.enter > 0.02) sceneLife(c, t, st);
  readingCard(c, t, st);
  if (t > INDEX - 0.1) indexPanel(c, t, st);
  if (t > ENDCARD - 0.1) endCard(c, t);
  subtitles(c, t);
}

// ---------------- page contract ----------------
function setU(st, t) {
  const cam = st.cam;
  gl.uniform2f(U('uCam'), ...cam.c); gl.uniform1f(U('uZ'), cam.z); gl.uniform1f(U('uRot'), cam.th); gl.uniform1f(U('uT'), t);
  const fl = t < 0.15 ? 0.0 : t < 0.27 ? 0.55 : t < 0.40 ? 0.08 : t < 0.55 ? 0.8 : t < LIGHT_ON ? 0.45 : 1.0;
  gl.uniform1f(U('uLight'), fl);
  gl.uniform2f(U('uLensC'), ...st.ls); gl.uniform1f(U('uLensR'), st.R); gl.uniform1f(U('uLensOn'), st.on); gl.uniform1f(U('uLensA'), st.A); gl.uniform1f(U('uLift'), st.lift);
  gl.uniform2f(U('uIntC'), ...st.ic); gl.uniform1f(U('uS'), st.S); gl.uniform1f(U('uK'), st.k);
  gl.uniform1f(U('uEnter'), st.enter);
  gl.uniform1f(U('uFocus'), st.dive ? st.dive.i : -1);
  gl.uniform1f(U('uDimOthers'), st.dive ? 0.10 * st.A : 0);
  const lay = layerAt(st, t);
  gl.uniform1f(U('uLayer'), lay.on); gl.uniform2f(U('uPar'), ...lay.par); gl.uniform2f(U('uSub'), ...lay.sub);
  gl.uniform2f(U('uSubC'), ...lay.c); gl.uniform1f(U('uSubK'), lay.k); gl.uniform1f(U('uLP'), lay.p);
}
window.DUR = DUR;
const EV = [];
EV.push({ t: 0.15, type: 'starter' }, { t: 0.40, type: 'starter' }, { t: LIGHT_ON, type: 'lighton' });
EVENTS.forEach((e, i) => {
  EV.push({ t: e.drop - 0.05, type: 'loupe' }, { t: e.lift, type: 'lift' });
  if (i > 0) EV.push({ t: EVENTS[i - 1].lift + 0.1, type: 'glide', d: e.drop - EVENTS[i - 1].lift });
  if (e.push) EV.push({ t: e.drop + 0.15, type: 'push', d: 0.9 }, { t: e.lift - 0.95, type: 'rise', d: 0.9 });
  EV.push({ t: e.t0 + 0.15, type: 'card' });
});
EV.push({ t: PULL, type: 'glide', d: 2.0 });
PRINTS.forEach((r, i) => EV.push({ t: INDEX + 0.6 + i * 0.12, type: 'tick' }));
EV.push({ t: ENDCARD, type: 'end' });
window.EV = EV;
window.render = t => {
  const st = shot(t);
  gl.viewport(0, 0, W, H); setU(st, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  overlay(t, st);
  gl.finish();
};
window.TEXTS = t => { window.render(t); return TXT; };
async function load() {
  for (const f of ['400 20px MS', '500 20px MS', '600 20px MS', '400 20px PM', '500 20px PM', '600 20px CG', '500 20px CGI']) await document.fonts.load(f);
  ATLAS = await (await fetch('assets/atlas.json')).json();
  initGL();
  const [im, bg, sb] = await Promise.all(['assets/atlas.jpg', 'assets/background.jpg', 'assets/subjects.png'].map(img));
  tex(0, im); gl.uniform1i(U('tA'), 0);
  tex(1, bg); gl.uniform1i(U('tB'), 1);
  tex(2, sb); gl.uniform1i(U('tS'), 2);
  gl.uniform4fv(U('uIt'), new Float32Array(IT.flatMap(it => [it.c[0], it.c[1], it.r, 0])));
  gl.uniform4fv(U('uUV'), new Float32Array(ATLAS.flatMap(a => [a.u0, a.v0, a.u1, a.v1])));
}
load().then(() => { window.render(0); window.READY = true; });
