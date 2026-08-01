/**
 * The design atlas — a 4×4 grid of distinct, designed "screens" (landing
 * pages, dashboards, CRMs, kanbans, analytics) drawn in the brand system.
 * Tile 0 is the identical corridor template; tile 1 is a plain machined
 * face for nodes and rails. After the Intervention, each panel switches
 * from tile 0 to its own design — sameness becomes distinctiveness.
 *
 * All "text" is skeleton bars: crisp, deliberate, and impossible to
 * misread as garbled AI type.
 */

const W = 4096;
const H = 2048;
export const TILE_COLS = 4;
export const TILE_ROWS = 4;

const INK = "rgba(236,241,248,";
const DIM = "rgba(155,184,212,";
const ACCENT = "#3d6a96";
const ACCENT_BRIGHT = "#5a8fc4";
const VIOLET = "#645fa8";
const BG = "#0a0e15";
const CARD = "#111722";
const LINE = "rgba(155,184,212,0.14)";

type Ctx = CanvasRenderingContext2D;
type Rand = () => number;

function mulberry32(seed: number): Rand {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}

/** draw an image cover-cropped into a rect */
function cover(ctx: Ctx, im: HTMLImageElement, x: number, y: number, w: number, h: number, alpha = 1) {
  const s = Math.max(w / im.width, h / im.height);
  const dw = im.width * s;
  const dh = im.height * s;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function bar(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

/** browser chrome strip across a tile top; returns content top */
function chrome(ctx: Ctx, x: number, y: number, w: number): number {
  const h = 40;
  bar(ctx, x, y, w, h, "#0d131c");
  ctx.fillStyle = "rgba(155,184,212,0.28)";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + 26 + i * 20, y + h / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  bar(ctx, x + 90, y + 12, w * 0.4, 16, "rgba(155,184,212,0.09)");
  bar(ctx, x, y + h - 1, w, 1, LINE);
  return y + h;
}

/** skeleton text block */
function copyBlock(ctx: Ctx, r: Rand, x: number, y: number, w: number, lines: number, big = false) {
  let yy = y;
  for (let i = 0; i < lines; i++) {
    const lw = w * (0.55 + r() * 0.4) * (i === lines - 1 ? 0.6 : 1);
    const lh = big && i === 0 ? 26 : 10;
    bar(ctx, x, yy, lw, lh, big && i === 0 ? `${INK}0.85)` : `${DIM}0.35)`);
    yy += lh + (big && i === 0 ? 18 : 12);
  }
  return yy;
}

function navRow(ctx: Ctx, x: number, y: number, w: number) {
  bar(ctx, x, y, 74, 14, `${INK}0.9)`);
  for (let i = 0; i < 3; i++) bar(ctx, x + w - 260 + i * 78, y + 2, 48, 9, `${DIM}0.45)`);
  bar(ctx, x + w - 100, y - 6, 86, 28, "rgba(155,184,212,0.16)");
}

function chip(ctx: Ctx, x: number, y: number, w: number, bright = false) {
  bar(ctx, x, y, w, 30, bright ? ACCENT_BRIGHT : "rgba(155,184,212,0.2)");
}

function lineChart(ctx: Ctx, r: Rand, x: number, y: number, w: number, h: number, color = ACCENT_BRIGHT) {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + (h / 4) * i);
    ctx.lineTo(x + w, y + (h / 4) * i);
    ctx.stroke();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  let vy = y + h * (0.4 + r() * 0.3);
  ctx.moveTo(x, vy);
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    vy = Math.max(y + 6, Math.min(y + h - 4, vy + (r() - 0.55) * h * 0.35));
    ctx.lineTo(x + (w / steps) * i, vy);
  }
  ctx.stroke();
}

function barChart(ctx: Ctx, r: Rand, x: number, y: number, w: number, h: number) {
  const n = 7;
  const bw = w / n - 10;
  for (let i = 0; i < n; i++) {
    const bh = h * (0.25 + r() * 0.7);
    bar(ctx, x + i * (bw + 10), y + h - bh, bw, bh, i === 4 ? ACCENT_BRIGHT : "rgba(155,184,212,0.3)");
  }
}

function donut(ctx: Ctx, x: number, y: number, rad: number) {
  ctx.lineWidth = 16;
  ctx.strokeStyle = "rgba(155,184,212,0.18)";
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = ACCENT_BRIGHT;
  ctx.beginPath();
  ctx.arc(x, y, rad, -Math.PI / 2, Math.PI * 0.9);
  ctx.stroke();
  ctx.strokeStyle = VIOLET;
  ctx.beginPath();
  ctx.arc(x, y, rad, Math.PI * 0.9, Math.PI * 1.4);
  ctx.stroke();
}

function statTiles(ctx: Ctx, r: Rand, x: number, y: number, w: number, n: number) {
  const tw = w / n - 12;
  for (let i = 0; i < n; i++) {
    const tx = x + i * (tw + 12);
    bar(ctx, tx, y, tw, 86, CARD);
    bar(ctx, tx + 16, y + 16, tw * 0.4, 9, `${DIM}0.4)`);
    bar(ctx, tx + 16, y + 38, tw * 0.55, 20, `${INK}0.85)`);
    bar(ctx, tx + 16, y + 68, tw * 0.3, 6, i === 0 ? ACCENT_BRIGHT : `${DIM}0.3)`);
  }
  return y + 98;
}

function tableRows(ctx: Ctx, r: Rand, x: number, y: number, w: number, rows: number) {
  for (let i = 0; i < rows; i++) {
    const ry = y + i * 44;
    if (i % 2 === 1) bar(ctx, x, ry, w, 44, "rgba(255,255,255,0.015)");
    ctx.fillStyle = `rgba(${120 + i * 10},${150 + i * 8},200,0.5)`;
    ctx.beginPath();
    ctx.arc(x + 22, ry + 22, 11, 0, Math.PI * 2);
    ctx.fill();
    bar(ctx, x + 48, ry + 17, w * 0.2 * (0.7 + r() * 0.5), 9, `${INK}0.6)`);
    bar(ctx, x + w * 0.4, ry + 17, w * 0.16, 9, `${DIM}0.35)`);
    chipPill(ctx, x + w * 0.68, ry + 12, i);
    bar(ctx, x + w * 0.88, ry + 17, w * 0.08, 9, `${DIM}0.3)`);
    bar(ctx, x, ry + 43, w, 1, LINE);
  }
}

function chipPill(ctx: Ctx, x: number, y: number, i: number) {
  const colors = ["rgba(90,143,196,0.5)", "rgba(100,95,168,0.5)", "rgba(155,184,212,0.25)"];
  bar(ctx, x, y, 64, 20, colors[i % 3]);
}

function kanban(ctx: Ctx, r: Rand, x: number, y: number, w: number, h: number) {
  const cols = 4;
  const cw = w / cols - 14;
  for (let c = 0; c < cols; c++) {
    const cx = x + c * (cw + 14);
    bar(ctx, cx, y, cw * 0.5, 10, `${DIM}0.5)`);
    const cards = 2 + Math.floor(r() * 3);
    let cy = y + 24;
    for (let k = 0; k < cards && cy + 64 < y + h; k++) {
      bar(ctx, cx, cy, cw, 58, CARD);
      bar(ctx, cx + 12, cy + 12, cw * 0.7 * (0.6 + r() * 0.5), 8, `${INK}0.6)`);
      bar(ctx, cx + 12, cy + 30, cw * 0.4, 7, `${DIM}0.3)`);
      bar(ctx, cx + 12, cy + 44, 30, 6, c === 1 && k === 0 ? ACCENT_BRIGHT : `${DIM}0.25)`);
      cy += 70;
    }
  }
}

function sidebar(ctx: Ctx, x: number, y: number, h: number): number {
  const w = 150;
  bar(ctx, x, y, w, h, "#0c1119");
  bar(ctx, x + 20, y + 22, 70, 12, `${INK}0.85)`);
  for (let i = 0; i < 6; i++) {
    bar(ctx, x + 20, y + 64 + i * 34, 90 * (0.6 + (i % 3) * 0.2), 9, i === 1 ? ACCENT_BRIGHT : `${DIM}0.3)`);
  }
  bar(ctx, x + w - 1, y, 1, h, LINE);
  return x + w;
}

/* ── tile painters ── */

type ImgMap = Record<string, HTMLImageElement | undefined>;

function tileTemplate(ctx: Ctx, x: number, y: number, w: number, h: number) {
  /* the corridor's identical face — mirrors the old module texture */
  bar(ctx, x, y, w, h, "#000");
  bar(ctx, x + w * 0.14, y + h * 0.13, w * 0.72, h * 0.06, "rgba(120,160,200,0.5)");
  bar(ctx, x + w * 0.14, y + h * 0.28, w * 0.47, h * 0.035, "rgba(120,160,200,0.28)");
  bar(ctx, x + w * 0.14, y + h * 0.36, w * 0.58, h * 0.035, "rgba(120,160,200,0.28)");
  bar(ctx, x + w * 0.14, y + h * 0.54, w * 0.72, h * 0.3, "rgba(120,160,200,0.18)");
}

function tilePlain(ctx: Ctx, x: number, y: number, w: number, h: number) {
  bar(ctx, x, y, w, h, "#070b11");
  bar(ctx, x, y + h * 0.48, w, 2, "rgba(155,184,212,0.22)");
}

function tileLanding(ctx: Ctx, r: Rand, im: HTMLImageElement | undefined, x: number, y: number, w: number, h: number, imageTop: boolean) {
  bar(ctx, x, y, w, h, BG);
  const top = chrome(ctx, x, y, w);
  const pad = 44;
  if (imageTop) {
    if (im) cover(ctx, im, x, top, w, h * 0.58, 0.92);
    const g = ctx.createLinearGradient(0, top, 0, top + h * 0.58);
    g.addColorStop(0, "rgba(10,14,21,0.25)");
    g.addColorStop(1, "rgba(10,14,21,0.9)");
    ctx.fillStyle = g;
    ctx.fillRect(x, top, w, h * 0.58);
    navRow(ctx, x + pad, top + 26, w - pad * 2);
    bar(ctx, x + pad, y + h * 0.44, w * 0.5, 26, `${INK}0.92)`);
    bar(ctx, x + pad, y + h * 0.44 + 40, w * 0.34, 11, `${DIM}0.5)`);
    chip(ctx, x + pad, y + h * 0.66, 120, true);
    chip(ctx, x + pad + 134, y + h * 0.66, 100);
    for (let i = 0; i < 3; i++) {
      const cw = (w - pad * 2 - 28) / 3;
      bar(ctx, x + pad + i * (cw + 14), y + h * 0.78, cw, h * 0.14, CARD);
      bar(ctx, x + pad + i * (cw + 14) + 14, y + h * 0.78 + 14, cw * 0.5, 8, `${DIM}0.4)`);
    }
  } else {
    navRow(ctx, x + pad, top + 26, w - pad * 2);
    bar(ctx, x + pad, top + 96, w * 0.42, 26, `${INK}0.92)`);
    bar(ctx, x + pad, top + 140, w * 0.3, 11, `${DIM}0.5)`);
    chip(ctx, x + pad, top + 178, 120, true);
    if (im) cover(ctx, im, x + w * 0.55, top + 60, w * 0.4, h * 0.72, 0.95);
  }
}

function tileDashboard(ctx: Ctx, r: Rand, x: number, y: number, w: number, h: number) {
  bar(ctx, x, y, w, h, BG);
  const left = sidebar(ctx, x, y, h);
  const pad = 28;
  const cx = left + pad;
  const cw = x + w - pad - cx;
  bar(ctx, cx, y + 24, cw * 0.3, 16, `${INK}0.85)`);
  const sy = statTiles(ctx, r, cx, y + 60, cw, 4);
  bar(ctx, cx, sy + 12, cw * 0.62, h - (sy - y) - 40, CARD);
  lineChart(ctx, r, cx + 24, sy + 40, cw * 0.62 - 48, h - (sy - y) - 100);
  bar(ctx, cx + cw * 0.66, sy + 12, cw * 0.34, h - (sy - y) - 40, CARD);
  barChart(ctx, r, cx + cw * 0.66 + 20, sy + 44, cw * 0.34 - 40, h - (sy - y) - 110);
}

function tileCrm(ctx: Ctx, r: Rand, x: number, y: number, w: number, h: number) {
  bar(ctx, x, y, w, h, BG);
  const left = sidebar(ctx, x, y, h);
  const pad = 28;
  const cx = left + pad;
  const cw = x + w - pad - cx;
  bar(ctx, cx, y + 22, cw * 0.24, 15, `${INK}0.85)`);
  bar(ctx, cx + cw - 110, y + 16, 110, 30, ACCENT);
  bar(ctx, cx, y + 62, cw, 34, CARD);
  tableRows(ctx, r, cx, y + 100, cw, Math.floor((h - 130) / 44));
}

function tileKanban(ctx: Ctx, r: Rand, x: number, y: number, w: number, h: number) {
  bar(ctx, x, y, w, h, BG);
  const top = chrome(ctx, x, y, w);
  bar(ctx, x + 36, top + 20, w * 0.2, 14, `${INK}0.85)`);
  kanban(ctx, r, x + 36, top + 58, w - 72, h - (top - y) - 80);
}

function tileAnalytics(ctx: Ctx, r: Rand, x: number, y: number, w: number, h: number) {
  bar(ctx, x, y, w, h, BG);
  const pad = 40;
  bar(ctx, x + pad, y + 30, w * 0.2, 14, `${INK}0.85)`);
  bar(ctx, x + pad, y + 66, w * 0.16, 40, `${INK}0.95)`);
  bar(ctx, x + pad, y + 118, w * 0.1, 9, ACCENT_BRIGHT);
  donut(ctx, x + w * 0.78, y + h * 0.32, 58);
  bar(ctx, x + pad, y + h * 0.42, w - pad * 2, 1, LINE);
  lineChart(ctx, r, x + pad, y + h * 0.5, w - pad * 2, h * 0.4, ACCENT_BRIGHT);
}

function tilePortal(ctx: Ctx, r: Rand, ims: (HTMLImageElement | undefined)[], x: number, y: number, w: number, h: number) {
  bar(ctx, x, y, w, h, BG);
  const top = chrome(ctx, x, y, w);
  const pad = 36;
  navRow(ctx, x + pad, top + 20, w - pad * 2);
  const gy = top + 64;
  const cw = (w - pad * 2 - 28) / 3;
  const ch = h - (gy - y) - 30;
  for (let i = 0; i < 3; i++) {
    const cx = x + pad + i * (cw + 14);
    bar(ctx, cx, gy, cw, ch, CARD);
    const im = ims[i % ims.length];
    if (im) cover(ctx, im, cx, gy, cw, ch * 0.55, 0.9);
    bar(ctx, cx + 14, gy + ch * 0.55 + 14, cw * 0.6, 10, `${INK}0.75)`);
    bar(ctx, cx + 14, gy + ch * 0.55 + 34, cw * 0.42, 8, `${DIM}0.35)`);
    bar(ctx, cx + 14, gy + ch - 30, 56, 16, "rgba(155,184,212,0.2)");
  }
}

function tileInbox(ctx: Ctx, r: Rand, x: number, y: number, w: number, h: number) {
  bar(ctx, x, y, w, h, BG);
  bar(ctx, x, y, w * 0.34, h, "#0c1119");
  bar(ctx, x + w * 0.34, y, 1, h, LINE);
  for (let i = 0; i < 6; i++) {
    const ry = y + 20 + i * ((h - 40) / 6);
    ctx.fillStyle = `rgba(140,${160 + i * 6},210,0.45)`;
    ctx.beginPath();
    ctx.arc(x + 34, ry + 16, 11, 0, Math.PI * 2);
    ctx.fill();
    bar(ctx, x + 58, ry + 6, w * 0.16 * (0.7 + r() * 0.4), 9, `${INK}${i === 1 ? "0.9" : "0.55"})`);
    bar(ctx, x + 58, ry + 22, w * 0.2, 7, `${DIM}0.3)`);
  }
  const mx = x + w * 0.34 + 30;
  bar(ctx, mx, y + 30, w * 0.3, 14, `${INK}0.85)`);
  copyBlock(ctx, r, mx, y + 70, w * 0.55, 5);
  bar(ctx, mx, y + h - 70, w * 0.55, 44, CARD);
  bar(ctx, mx + 16, y + h - 56, w * 0.2, 9, `${DIM}0.3)`);
}

function tilePricing(ctx: Ctx, r: Rand, x: number, y: number, w: number, h: number) {
  bar(ctx, x, y, w, h, BG);
  const top = chrome(ctx, x, y, w);
  bar(ctx, x + w / 2 - w * 0.12, top + 24, w * 0.24, 18, `${INK}0.9)`);
  const pad = 60;
  const cw = (w - pad * 2 - 40) / 3;
  for (let i = 0; i < 3; i++) {
    const cx = x + pad + i * (cw + 20);
    const cy = top + 70;
    const chh = h - (top - y) - 100;
    bar(ctx, cx, cy, cw, chh, i === 1 ? "#151d2b" : CARD);
    if (i === 1) {
      ctx.strokeStyle = ACCENT_BRIGHT;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx + 1, cy + 1, cw - 2, chh - 2);
    }
    bar(ctx, cx + 20, cy + 22, cw * 0.4, 10, `${DIM}0.5)`);
    bar(ctx, cx + 20, cy + 48, cw * 0.5, 26, `${INK}0.9)`);
    for (let l = 0; l < 4; l++) bar(ctx, cx + 20, cy + 100 + l * 24, cw * 0.6 * (0.7 + r() * 0.4), 7, `${DIM}0.3)`);
    bar(ctx, cx + 20, cy + chh - 46, cw - 40, 30, i === 1 ? ACCENT_BRIGHT : "rgba(155,184,212,0.18)");
  }
}

function tileEditorial(ctx: Ctx, r: Rand, im: HTMLImageElement | undefined, x: number, y: number, w: number, h: number) {
  bar(ctx, x, y, w, h, "#0d0f14");
  if (im) cover(ctx, im, x + w * 0.5, y, w * 0.5, h, 0.95);
  bar(ctx, x + 50, y + 60, 60, 12, `${INK}0.9)`);
  bar(ctx, x + 50, y + h * 0.3, w * 0.34, 30, `${INK}0.92)`);
  bar(ctx, x + 50, y + h * 0.3 + 46, w * 0.3, 30, `${INK}0.92)`);
  copyBlock(ctx, r, x + 50, y + h * 0.55, w * 0.32, 3);
  bar(ctx, x + 50, y + h * 0.8, 110, 2, `${INK}0.8)`);
}

/* ── the atlas ── */

export async function buildDesignAtlas(): Promise<HTMLCanvasElement> {
  const sources = [
    "/film/site-restaurant-poster.jpg",
    "/film/work-meridian.png",
    "/film/work-halewood.png",
    "/film/work-arla.png",
    "/film/img-property.png",
    "/film/img-wellness.png",
    "/film/img-brand.png",
  ];
  const settled = await Promise.allSettled(sources.map(loadImage));
  const img: ImgMap = {};
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") img[sources[i]] = s.value;
  });
  const pick = (k: string) => img[k];

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  const r = mulberry32(471123);
  const tw = W / TILE_COLS;
  const th = H / TILE_ROWS;

  const at = (i: number) => ({
    x: (i % TILE_COLS) * tw,
    y: Math.floor(i / TILE_COLS) * th,
  });

  /* 0: identical template · 1: plain machined face */
  {
    const p = at(0);
    tileTemplate(ctx, p.x, p.y, tw, th);
  }
  {
    const p = at(1);
    tilePlain(ctx, p.x, p.y, tw, th);
  }
  const painters: ((x: number, y: number) => void)[] = [
    (x, y) => tileLanding(ctx, r, pick("/film/site-restaurant-poster.jpg"), x, y, tw, th, true),
    (x, y) => tileDashboard(ctx, r, x, y, tw, th),
    (x, y) => tileLanding(ctx, r, pick("/film/img-property.png"), x, y, tw, th, false),
    (x, y) => tileCrm(ctx, r, x, y, tw, th),
    (x, y) => tileKanban(ctx, r, x, y, tw, th),
    (x, y) => tileLanding(ctx, r, pick("/film/img-wellness.png"), x, y, tw, th, true),
    (x, y) => tileAnalytics(ctx, r, x, y, tw, th),
    (x, y) =>
      tilePortal(ctx, r, [pick("/film/work-meridian.png"), pick("/film/work-halewood.png"), pick("/film/work-arla.png")], x, y, tw, th),
    (x, y) => tileInbox(ctx, r, x, y, tw, th),
    (x, y) => tilePricing(ctx, r, x, y, tw, th),
    (x, y) => tileEditorial(ctx, r, pick("/film/img-brand.png"), x, y, tw, th),
    (x, y) => tileLanding(ctx, r, pick("/film/work-arla.png"), x, y, tw, th, false),
    (x, y) => tileDashboard(ctx, r, x, y, tw, th),
    (x, y) => tileCrm(ctx, r, x, y, tw, th),
  ];
  painters.forEach((paint, i) => {
    const p = at(i + 2);
    paint(p.x, p.y);
  });

  return cv;
}

/* ── the hero pages: complete designed sites with real typography ── */

function fontStack(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return v ? `${v}, ${fallback}` : fallback;
}

interface HeroCtx {
  ctx: Ctx;
  W: number;
  H: number;
  display: string;
  mono: string;
  img: ImgMap;
}

function heroBase(): { c: HTMLCanvasElement; h: HeroCtx } {
  const c = document.createElement("canvas");
  c.width = 1600;
  c.height = 900;
  const ctx = c.getContext("2d")!;
  return {
    c,
    h: {
      ctx,
      W: 1600,
      H: 900,
      display: fontStack("--font-display", "sans-serif"),
      mono: fontStack("--font-mono", "monospace"),
      img: {},
    },
  };
}

function text(
  h: HeroCtx,
  s: string,
  x: number,
  y: number,
  opts: {
    size?: number;
    weight?: number;
    mono?: boolean;
    color?: string;
    spacing?: number;
    align?: CanvasTextAlign;
  } = {},
) {
  const { ctx } = h;
  const size = opts.size ?? 24;
  const family = opts.mono ? h.mono : h.display;
  ctx.font = `${opts.weight ?? (opts.mono ? 500 : 600)} ${size}px ${family}`;
  ctx.fillStyle = opts.color ?? "rgba(240,244,249,0.95)";
  ctx.textAlign = opts.align ?? "left";
  ctx.textBaseline = "alphabetic";
  if (opts.spacing) {
    let cx = x;
    for (const ch of s) {
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + opts.spacing;
    }
  } else {
    ctx.fillText(s, x, y);
  }
}

function outlineChip(h: HeroCtx, label: string, x: number, y: number) {
  const { ctx } = h;
  ctx.font = `500 20px ${h.mono}`;
  const w = ctx.measureText(label).width + 56;
  ctx.strokeStyle = "rgba(240,244,249,0.65)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, 54);
  text(h, label, x + 28, y + 35, { size: 20, mono: true, spacing: 3 });
  return w;
}

function solidChip(h: HeroCtx, label: string, x: number, y: number) {
  const { ctx } = h;
  ctx.font = `500 20px ${h.mono}`;
  const w = ctx.measureText(label).width + 56;
  ctx.fillStyle = "#e8eef5";
  ctx.fillRect(x, y, w, 54);
  text(h, label, x + 28, y + 35, { size: 20, mono: true, color: "#0a0e15", spacing: 3 });
  return w;
}

function heroShade(h: HeroCtx, topAlpha = 0.35, bottomAlpha = 0.78) {
  const g = h.ctx.createLinearGradient(0, 0, 0, h.H);
  g.addColorStop(0, `rgba(4,6,10,${topAlpha})`);
  g.addColorStop(0.45, "rgba(4,6,10,0.08)");
  g.addColorStop(1, `rgba(4,6,10,${bottomAlpha})`);
  h.ctx.fillStyle = g;
  h.ctx.fillRect(0, 0, h.W, h.H);
}

function siteNav(h: HeroCtx, brand: string, links: string[]) {
  text(h, brand, 70, 78, { size: 26, spacing: 8 });
  let x = h.W - 70;
  h.ctx.font = `500 17px ${h.mono}`;
  [...links].reverse().forEach((l) => {
    x -= h.ctx.measureText(l).width + 12;
    text(h, l, x, 76, { size: 17, mono: true, color: "rgba(200,212,226,0.75)" });
    x -= 34;
  });
}

/** VEYRA — property landing */
function pageVeyra(img: ImgMap): HTMLCanvasElement {
  const { c, h } = heroBase();
  const im = img["/film/img-property.png"];
  h.ctx.fillStyle = "#080b11";
  h.ctx.fillRect(0, 0, h.W, h.H);
  if (im) cover(h.ctx, im, 0, 0, h.W, h.H, 0.96);
  heroShade(h);
  siteNav(h, "VEYRA", ["Residences", "Approach", "Contact"]);
  text(h, "Homes with presence.", 70, h.H - 210, { size: 92 });
  text(h, "Twelve residences. One ridge line. No repetition.", 70, h.H - 150, {
    size: 24,
    weight: 500,
    color: "rgba(210,220,232,0.8)",
  });
  outlineChip(h, "VIEW RESIDENCES", 70, h.H - 116);
  return c;
}

/** MERIDIAN OS — operations dashboard */
function pageMeridian(img: ImgMap): HTMLCanvasElement {
  const { c, h } = heroBase();
  const { ctx } = h;
  ctx.fillStyle = "#0a0e15";
  ctx.fillRect(0, 0, h.W, h.H);
  /* sidebar */
  ctx.fillStyle = "#0d1119";
  ctx.fillRect(0, 0, 280, h.H);
  ctx.fillStyle = LINE;
  ctx.fillRect(280, 0, 1, h.H);
  text(h, "MERIDIAN OS", 36, 66, { size: 22, spacing: 4 });
  ["Dispatch", "Fleet", "Invoices", "Reports", "Settings"].forEach((s, i) => {
    if (i === 0) {
      ctx.fillStyle = "rgba(90,143,196,0.16)";
      ctx.fillRect(20, 108 + i * 58 - 28, 240, 44);
    }
    text(h, s, 36, 108 + i * 58, {
      size: 19,
      mono: true,
      color: i === 0 ? "#9bc0e8" : "rgba(190,202,216,0.6)",
    });
  });
  /* header + stats */
  text(h, "Operations", 330, 76, { size: 34 });
  text(h, "Live · Tuesday 09:41", h.W - 70, 72, {
    size: 16,
    mono: true,
    color: "rgba(155,184,212,0.6)",
    align: "right",
  });
  const stats: [string, string, string][] = [
    ["ON-TIME DELIVERY", "98.2%", "+1.4"],
    ["ACTIVE JOBS", "143", "+12"],
    ["FLEET UTILISATION", "87%", "+3.1"],
    ["INVOICES CLEARED", "£1.2M", "+8%"],
  ];
  const sw = (h.W - 330 - 70 - 60) / 4;
  stats.forEach(([label, value, delta], i) => {
    const x = 330 + i * (sw + 20);
    ctx.fillStyle = CARD;
    ctx.fillRect(x, 104, sw, 130);
    text(h, label, x + 24, 140, { size: 14, mono: true, color: "rgba(155,184,212,0.55)" });
    text(h, value, x + 24, 196, { size: 40 });
    text(h, delta, x + 24, 222, { size: 15, mono: true, color: "#7fb28a" });
  });
  /* chart card */
  ctx.fillStyle = CARD;
  ctx.fillRect(330, 260, 740, 560);
  text(h, "Throughput", 358, 300, { size: 20 });
  const r = mulberry32(88);
  lineChart(ctx, r, 358, 330, 684, 420, "#5a8fc4");
  ["06:00", "09:00", "12:00", "15:00", "18:00"].forEach((tlabel, i) => {
    text(h, tlabel, 358 + i * 165, 792, { size: 13, mono: true, color: "rgba(155,184,212,0.45)" });
  });
  /* live jobs table */
  ctx.fillStyle = CARD;
  ctx.fillRect(1090, 260, h.W - 1090 - 70, 560);
  text(h, "Live jobs", 1118, 300, { size: 20 });
  const rows: [string, string, string][] = [
    ["LDN → MAN", "Kestrel 7", "In transit"],
    ["BHX → LDS", "Marlin 2", "Loading"],
    ["MAN → GLA", "Kestrel 3", "In transit"],
    ["LDN → BRS", "Heron 9", "Delivered"],
    ["LDS → NCL", "Marlin 5", "In transit"],
    ["GLA → EDI", "Heron 1", "Delivered"],
  ];
  rows.forEach(([route, unit, status], i) => {
    const y = 348 + i * 78;
    text(h, route, 1118, y, { size: 19, mono: true });
    text(h, unit, 1118, y + 26, { size: 15, mono: true, color: "rgba(155,184,212,0.5)" });
    const col =
      status === "Delivered" ? "rgba(127,178,138,0.8)" : status === "Loading" ? "rgba(212,181,127,0.85)" : "rgba(90,143,196,0.9)";
    text(h, status.toUpperCase(), h.W - 98, y + 10, { size: 13, mono: true, color: col, align: "right" });
    ctx.fillStyle = LINE;
    ctx.fillRect(1118, y + 44, h.W - 1090 - 70 - 56, 1);
  });
  return c;
}

/** HALE — wellness */
function pageHale(img: ImgMap): HTMLCanvasElement {
  const { c, h } = heroBase();
  const im = img["/film/img-wellness.png"];
  h.ctx.fillStyle = "#0b0d11";
  h.ctx.fillRect(0, 0, h.W, h.H);
  if (im) cover(h.ctx, im, h.W * 0.44, 0, h.W * 0.56, h.H, 0.95);
  const g = h.ctx.createLinearGradient(h.W * 0.38, 0, h.W * 0.62, 0);
  g.addColorStop(0, "#0b0d11");
  g.addColorStop(1, "rgba(11,13,17,0)");
  h.ctx.fillStyle = g;
  h.ctx.fillRect(h.W * 0.38, 0, h.W * 0.24, h.H);
  text(h, "HALE.", 70, 84, { size: 30, spacing: 6 });
  text(h, "Rest,", 70, 380, { size: 100 });
  text(h, "engineered.", 70, 480, { size: 100 });
  text(h, "Recovery rooms, thermal circuits and", 70, 560, { size: 22, weight: 500, color: "rgba(210,220,232,0.75)" });
  text(h, "treatments booked in one quiet system.", 70, 592, { size: 22, weight: 500, color: "rgba(210,220,232,0.75)" });
  outlineChip(h, "BOOK A SESSION", 70, 650);
  text(h, "EST. 2021 — COPENHAGEN", 70, h.H - 60, { size: 14, mono: true, color: "rgba(155,184,212,0.5)" });
  return c;
}

/** ARLA & FROST — editorial portfolio */
function pageArla(img: ImgMap): HTMLCanvasElement {
  const { c, h } = heroBase();
  const im = img["/film/work-arla.png"];
  h.ctx.fillStyle = "#0c0e13";
  h.ctx.fillRect(0, 0, h.W, h.H);
  if (im) cover(h.ctx, im, h.W * 0.52, 60, h.W * 0.42, h.H - 120, 0.95);
  text(h, "ARLA & FROST", 70, 84, { size: 22, spacing: 6 });
  text(h, "Architects", h.W - 70, 84, { size: 17, mono: true, color: "rgba(200,212,226,0.6)", align: "right" });
  text(h, "Spaces that", 70, 360, { size: 88 });
  text(h, "argue for", 70, 448, { size: 88 });
  text(h, "themselves.", 70, 536, { size: 88 });
  const works = ["01 — Atelier North", "02 — Habitat Row", "03 — The Monolith"];
  works.forEach((wk, i) => {
    text(h, wk, 70, 650 + i * 44, { size: 19, mono: true, color: i === 0 ? "#cfe0f2" : "rgba(155,184,212,0.55)" });
  });
  h.ctx.fillStyle = "rgba(240,244,249,0.9)";
  h.ctx.fillRect(70, h.H - 92, 130, 2);
  return c;
}

/** NOCTIS — product brand */
function pageNoctis(img: ImgMap): HTMLCanvasElement {
  const { c, h } = heroBase();
  const im = img["/film/img-brand.png"];
  h.ctx.fillStyle = "#07080c";
  h.ctx.fillRect(0, 0, h.W, h.H);
  if (im) cover(h.ctx, im, 0, 0, h.W, h.H, 0.94);
  heroShade(h, 0.25, 0.7);
  siteNav(h, "NOCTIS", ["Collection", "Journal", "Cart — 0"]);
  text(h, "Crafted after dark.", 70, h.H - 190, { size: 88 });
  text(h, "Eau de parfum — 50ml", 70, h.H - 132, { size: 20, mono: true, color: "rgba(210,220,232,0.7)" });
  solidChip(h, "DISCOVER", 70, h.H - 100);
  return c;
}

/** transparent overlay for the AMBER video screen — real site chrome over film */
function overlayAmber(): HTMLCanvasElement {
  const { c, h } = heroBase();
  h.ctx.clearRect(0, 0, h.W, h.H);
  heroShade(h, 0.3, 0.72);
  siteNav(h, "AMBER", ["Menu", "Rooms", "Reserve"]);
  text(h, "A table worth keeping.", 70, h.H - 170, { size: 88 });
  outlineChip(h, "RESERVE", 70, h.H - 118);
  return c;
}

export interface HeroScreens {
  overlayAmber: HTMLCanvasElement;
  pages: HTMLCanvasElement[];
  captions: HTMLCanvasElement[];
}

function makeCaption(label: string, mono: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 72;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 1024, 72);
  ctx.font = `500 26px ${mono}`;
  ctx.fillStyle = "rgba(170,196,220,0.85)";
  let x = 0;
  for (const ch of label.toUpperCase()) {
    ctx.fillText(ch, x, 46);
    x += ctx.measureText(ch).width + 5;
  }
  return c;
}

let heroPromise: Promise<HeroScreens> | null = null;

export function getHeroScreens(): Promise<HeroScreens> {
  if (heroPromise) return heroPromise;
  heroPromise = (async () => {
    await (document.fonts?.ready ?? Promise.resolve());
    const sources = [
      "/film/img-property.png",
      "/film/img-wellness.png",
      "/film/img-brand.png",
      "/film/work-arla.png",
    ];
    const settled = await Promise.allSettled(sources.map(loadImage));
    const img: ImgMap = {};
    settled.forEach((s, i) => {
      if (s.status === "fulfilled") img[sources[i]] = s.value;
    });
    const mono = fontStack("--font-mono", "monospace");
    return {
      overlayAmber: overlayAmber(),
      pages: [pageVeyra(img), pageMeridian(img), pageHale(img), pageArla(img), pageNoctis(img)],
      captions: [
        makeCaption("Restaurant — Amber", mono),
        makeCaption("Property — Veyra", mono),
        makeCaption("Logistics — Meridian OS", mono),
        makeCaption("Wellness — Hale", mono),
        makeCaption("Architecture — Arla & Frost", mono),
        makeCaption("Brand — Noctis", mono),
      ],
    };
  })();
  return heroPromise;
}

let atlasPromise: Promise<HTMLCanvasElement> | null = null;

/** the atlas is built once and shared */
export function getAtlas(): Promise<HTMLCanvasElement> {
  if (!atlasPromise) atlasPromise = buildDesignAtlas();
  return atlasPromise;
}

/** a single tile as its own full-resolution canvas (for the hero screens) */
export async function buildTileCanvas(i: number): Promise<HTMLCanvasElement> {
  const atlas = await getAtlas();
  const tw = W / TILE_COLS;
  const th = H / TILE_ROWS;
  const c = document.createElement("canvas");
  c.width = tw;
  c.height = th;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(
    atlas,
    (i % TILE_COLS) * tw,
    Math.floor(i / TILE_COLS) * th,
    tw,
    th,
    0,
    0,
    tw,
    th,
  );
  return c;
}

/** uv offset of a tile, in 0..1 atlas space (v measured from bottom, GL-style) */
export function tileOffset(i: number): [number, number] {
  const col = i % TILE_COLS;
  const row = Math.floor(i / TILE_COLS);
  return [col / TILE_COLS, 1 - (row + 1) / TILE_ROWS];
}

export const TILE_SCALE: [number, number] = [1 / TILE_COLS, 1 / TILE_ROWS];
export const DESIGN_TILES = Array.from({ length: 14 }, (_, i) => i + 2);
