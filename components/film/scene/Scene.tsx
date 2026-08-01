"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { chan, cinema, clamp01, lerp, smoothstep } from "@/lib/cinema";
import { buildKParts, gapCenterX, K } from "./kGeometry";
import {
  getAtlas,
  getHeroScreens,
  tileOffset,
  TILE_SCALE,
  DESIGN_TILES,
} from "./designAtlas";

const BG = new THREE.Color("#050608");
const FLOOR_Y = -K.stemH / 2 - 0.02;

/* deterministic pseudo-random, stable across reloads */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- materials & textures ---------- */

function useKMaterial() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#0d1219"),
        metalness: 0.82,
        roughness: 0.3,
        clearcoat: 0.65,
        clearcoatRoughness: 0.22,
        envMapIntensity: 0.32,
        transparent: true,
        opacity: 0,
      }),
    [],
  );
}

function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(235,244,255,1)");
    g.addColorStop(0.25, "rgba(190,214,238,0.55)");
    g.addColorStop(1, "rgba(155,184,212,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/* the design atlas — every module face samples one tile of it */
function useAtlasTexture() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 4;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => {
    let cancelled = false;
    getAtlas().then((canvas) => {
      if (cancelled) return;
      tex.image = canvas;
      tex.needsUpdate = true;
    });
    return () => {
      cancelled = true;
    };
  }, [tex]);
  return tex;
}

/* ---------- the journey: corridor → lattice ---------- */

const MODULE_W = 1.7;
const MODULE_H = 2.3;
const COLS = 34;
const ROWS = 3;
const STEP_Z = 1.25;
const CORRIDOR_START = -5.5;

type PartKind = "panel" | "node" | "path";

interface InstanceData {
  basePos: THREE.Vector3;
  baseRy: number;
  midPos: THREE.Vector3;
  midRot: THREE.Euler;
  targetA: THREE.Vector3;
  targetB: THREE.Vector3;
  targetRot: THREE.Euler;
  targetScale: THREE.Vector3;
  kind: PartKind;
  z: number;
  phase: number;
  /** ~30% of fragments dissolve during reorganisation — fewer, bolder objects */
  sink: boolean;
}

function useJourney() {
  return useMemo(() => {
    const rand = mulberry32(20260731);
    const data: InstanceData[] = [];
    /* ordered counters per kind — the reorganisation must read as
       engineered structure, not debris */
    let nPanel = 0;
    let nNode = 0;
    let nPath = 0;
    for (let side = 0; side < 2; side++) {
      const x = side === 0 ? -2.35 : 2.35;
      const ry = side === 0 ? Math.PI / 2 : -Math.PI / 2;
      for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
          const y = FLOOR_Y + MODULE_H / 2 + 0.06 + row * (MODULE_H + 0.14);
          const z = CORRIDOR_START - col * STEP_Z;
          const r1 = rand();
          const r2 = rand();
          const r3 = rand();
          const r4 = rand();

          const kindRoll = rand();
          const kind: PartKind =
            kindRoll < 0.4 ? "panel" : kindRoll < 0.8 ? "node" : "path";

          const basePos = new THREE.Vector3(x, y, z);
          const midPos = basePos
            .clone()
            .add(
              new THREE.Vector3(
                (r1 - 0.5) * 1.6,
                (r2 - 0.5) * 1.4,
                (r3 - 0.5) * 1.2,
              ),
            );
          const midRot = new THREE.Euler(
            (r2 - 0.5) * 1.4,
            ry + (r1 - 0.5) * 1.6,
            (r3 - 0.5) * 1.2,
          );

          let targetA: THREE.Vector3;
          let targetRot: THREE.Euler;
          let targetScale: THREE.Vector3;
          if (kind === "panel") {
            /* a distant constellation of work — atmosphere, not content.
               The exhibition itself is carried by six monumental screens. */
            const k = nPanel++;
            const tier = k % 3;
            const rank = Math.floor(k / 3);
            const sideT = rank % 2 === 0 ? -1 : 1;
            targetA = new THREE.Vector3(
              sideT * (6.5 + tier * 1.8 + r1 * 2.5),
              -0.6 + tier * 2.3 + (r2 - 0.5) * 0.8,
              -34 - rank * 2.6,
            );
            targetRot = new THREE.Euler(0, sideT * -0.3, 0);
            targetScale = new THREE.Vector3(1.7, 0.55, 0.4);
          } else if (kind === "node") {
            /* the automation lattice — arrives with chapter 06, deeper */
            const k = nNode++;
            const ix = k % 5;
            const iy = Math.floor(k / 5) % 3;
            const iz = Math.floor(k / 15);
            targetA = new THREE.Vector3(
              -4.6 + ix * 2.3 + (r1 - 0.5) * 0.7,
              -0.5 + iy * 1.9 + (r2 - 0.5) * 0.5,
              -74 - iz * 3.4 + (r3 - 0.5) * 1.2,
            );
            targetRot = new THREE.Euler(0, r4 * Math.PI, 0);
            targetScale = new THREE.Vector3(0.24, 0.18, 2.6);
          } else {
            /* rails: floor-level lanes running along the travel */
            const k = nPath++;
            const lane = k % 3;
            const seg = Math.floor(k / 3);
            targetA = new THREE.Vector3(
              (lane - 1) * 1.45,
              FLOOR_Y + 0.16,
              -30.5 - seg * 3.1,
            );
            targetRot = new THREE.Euler(0, Math.PI / 2, 0);
            targetScale = new THREE.Vector3(1.9, 0.05, 0.6);
          }
          const targetB =
            kind === "panel"
              ? targetA
                  .clone()
                  .add(new THREE.Vector3(0, (r4 - 0.5) * 1.4, (r1 - 0.5) * 3))
              : targetA.clone();

          data.push({
            basePos,
            baseRy: ry,
            midPos,
            midRot,
            targetA,
            targetB,
            targetRot,
            targetScale,
            kind,
            z,
            phase: rand() * Math.PI * 2,
            sink: rand() < 0.45,
          });
        }
      }
    }

    /* network: connect a spread of node targets in dependency order */
    const nodes = data
      .filter((d) => d.kind === "node" && !d.sink)
      .sort((a, b) => b.targetA.z - a.targetA.z)
      .filter((_, i) => i % 4 === 0)
      .slice(0, 12);
    const connections: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push([nodes[i].targetA, nodes[i + 1].targetA]);
    }
    connections.push([nodes[0].targetA, nodes[4]?.targetA ?? nodes[0].targetA]);
    connections.push([nodes[2].targetA, nodes[7]?.targetA ?? nodes[2].targetA]);

    /* the record's route through the software zone */
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.6, 0.4, -31),
      new THREE.Vector3(0, -0.7, -37),
      new THREE.Vector3(2.7, 1.1, -43),
      new THREE.Vector3(-1.9, 1.7, -49),
      new THREE.Vector3(0.2, 0.2, -54),
    ]);

    return { data, connections, curve };
  }, []);
}

/* ---------- the 3D gallery: real website screens hung along the path ---------- */

interface GalleryScreen {
  group: THREE.Group;
  mats: THREE.MeshBasicMaterial[];
  baseY: number;
  phase: number;
  z: number;
}

function useGallery() {
  return useMemo(() => {
    const video = document.createElement("video");
    video.src = "/film/site-restaurant-720.mp4";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.play().catch(() => {
      /* muted autoplay is allowed; a rejection here is harmless */
    });
    const videoTex = new THREE.VideoTexture(video);
    videoTex.colorSpace = THREE.SRGBColorSpace;

    /* shared browser-chrome strip, painted once */
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 56;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0d121a";
    ctx.fillRect(0, 0, 1024, 56);
    ctx.fillStyle = "#2c3846";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(34 + i * 26, 28, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(155,184,212,0.12)";
    ctx.fillRect(130, 16, 640, 24);
    const chromeTex = new THREE.CanvasTexture(c);
    chromeTex.colorSpace = THREE.SRGBColorSpace;

    /* THE EXHIBITION — six complete concept sites along the glide
       (−44 → −70), alternating sides. Every face is a real designed page
       with real typography; the AMBER screen plays the film with its site
       chrome overlaid. */
    const defs: {
      x: number;
      y: number;
      z: number;
      ry: number;
      w: number;
      page: number | "video";
    }[] = [
      { x: -3.1, y: 1.0, z: -47.5, ry: 0.5, w: 4.6, page: "video" },
      { x: 3.15, y: 0.9, z: -52, ry: -0.48, w: 4.3, page: 0 },
      { x: -3.1, y: 1.1, z: -56.5, ry: 0.5, w: 4.6, page: 1 },
      { x: 3.15, y: 0.95, z: -61, ry: -0.48, w: 4.3, page: 2 },
      { x: -3.1, y: 1.05, z: -65.5, ry: 0.5, w: 4.4, page: 3 },
      { x: 3.15, y: 1.0, z: -70, ry: -0.48, w: 4.6, page: 4 },
    ];

    const toTex = (canvas: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    };

    const screens: GalleryScreen[] = defs.map((d, i) => {
      const group = new THREE.Group();
      const h = (d.w * 9) / 16;
      const barH = d.w * 0.05;
      const mats: THREE.MeshBasicMaterial[] = [];

      const mk = (map: THREE.Texture | null, color?: string) => {
        const m = new THREE.MeshBasicMaterial({
          map: map ?? undefined,
          color: color ?? "#ffffff",
          transparent: true,
          opacity: 0,
        });
        mats.push(m);
        return m;
      };

      /* backing slab — gives the screen physical thickness in the dark */
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(d.w + 0.12, h + barH + 0.16, 0.07),
        mk(null, "#0a0f16"),
      );
      back.position.z = -0.05;
      group.add(back);

      const chrome = new THREE.Mesh(
        new THREE.PlaneGeometry(d.w, barH),
        mk(chromeTex),
      );
      chrome.position.y = h / 2 + barH / 2 - 0.001;
      group.add(chrome);

      const mediaMat = mk(d.page === "video" ? videoTex : null, d.page === "video" ? undefined : "#0a0e15");
      const media = new THREE.Mesh(new THREE.PlaneGeometry(d.w, h), mediaMat);
      media.position.y = -barH / 2;
      group.add(media);

      /* site chrome over the film, and the real pages once fonts are ready */
      let overlayMat: THREE.MeshBasicMaterial | null = null;
      if (d.page === "video") {
        overlayMat = mk(null);
        overlayMat.visible = false;
        const overlay = new THREE.Mesh(
          new THREE.PlaneGeometry(d.w, h),
          overlayMat,
        );
        overlay.position.y = -barH / 2;
        overlay.position.z = 0.004;
        group.add(overlay);
      }

      /* caption plate beneath the work */
      const capMat = mk(null);
      capMat.visible = false;
      const cap = new THREE.Mesh(
        new THREE.PlaneGeometry(d.w * 0.6, d.w * 0.042),
        capMat,
      );
      cap.position.set(-d.w * 0.2 + 0.05, -(h / 2 + barH / 2 + 0.16), 0.002);
      group.add(cap);

      getHeroScreens().then((hs) => {
        if (d.page === "video") {
          if (overlayMat) {
            overlayMat.map = toTex(hs.overlayAmber);
            overlayMat.visible = true;
            overlayMat.needsUpdate = true;
          }
        } else {
          mediaMat.map = toTex(hs.pages[d.page]);
          mediaMat.color.set("#ffffff");
          mediaMat.needsUpdate = true;
        }
        capMat.map = toTex(hs.captions[i]);
        capMat.visible = true;
        capMat.needsUpdate = true;
      });

      group.position.set(d.x, d.y, d.z);
      group.rotation.y = d.ry;
      group.visible = false;
      return { group, mats, baseY: d.y, phase: i * 2.1, z: d.z };
    });

    return { screens, video };
  }, []);
}

/* ---------- the scene ---------- */

export default function Scene() {
  const { scene, camera } = useThree();
  const parts = useMemo(() => buildKParts(), []);
  const kMat = useKMaterial();
  const glowTex = useGlowTexture();
  const atlasTex = useAtlasTexture();
  const journey = useJourney();
  const gallery = useGallery();

  /* module geometry with a per-instance tile: which design each fragment
     becomes once the beam frees it from the template */
  const moduleGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(MODULE_W, MODULE_H, 0.14);
    const rand = mulberry32(99173);
    const arr = new Float32Array(journey.data.length * 3);
    let panelIdx = 0;
    journey.data.forEach((d, i) => {
      const [ox, oy] =
        d.kind === "panel" && !d.sink
          ? tileOffset(DESIGN_TILES[panelIdx++ % DESIGN_TILES.length])
          : tileOffset(1);
      arr[i * 3] = ox;
      arr[i * 3 + 1] = oy;
      arr[i * 3 + 2] = 0.2 + rand() * 0.5;
    });
    g.setAttribute("aTile", new THREE.InstancedBufferAttribute(arr, 3));
    return g;
  }, [journey]);

  /* shader patch: template tile before the Intervention, own tile after */
  const uReorg = useMemo(() => ({ value: 0 }), []);
  useEffect(() => {
    const mat = corridorMat.current;
    if (!mat) return;
    const tpl = tileOffset(0);
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uReorg = uReorg;
      shader.uniforms.uTemplateOff = {
        value: new THREE.Vector2(tpl[0], tpl[1]),
      };
      shader.uniforms.uTileScale = {
        value: new THREE.Vector2(TILE_SCALE[0], TILE_SCALE[1]),
      };
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
attribute vec3 aTile;
uniform float uReorg;
uniform vec2 uTemplateOff;
uniform vec2 uTileScale;
varying vec2 vAtlasUv;`,
        )
        .replace(
          "#include <uv_vertex>",
          `#include <uv_vertex>
vec2 kvTileOff = uReorg > aTile.z ? aTile.xy : uTemplateOff;
vAtlasUv = kvTileOff + uv * uTileScale;`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
varying vec2 vAtlasUv;`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#ifdef USE_EMISSIVEMAP
vec4 kvEmissive = texture2D( emissiveMap, vAtlasUv );
totalEmissiveRadiance *= kvEmissive.rgb;
#endif`,
        );
    };
    mat.needsUpdate = true;
  }, [uReorg]);

  const partRefs = useRef<(THREE.Group | null)[]>([]);
  const signalRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const beamLight = useRef<THREE.PointLight>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const rimA = useRef<THREE.DirectionalLight>(null);
  const rimB = useRef<THREE.DirectionalLight>(null);
  const seam = useRef<THREE.PointLight>(null);
  const corridorRef = useRef<THREE.InstancedMesh>(null);
  const corridorMat = useRef<THREE.MeshStandardMaterial>(null);
  const corridorLight = useRef<THREE.DirectionalLight>(null);
  const roomLight = useRef<THREE.PointLight>(null);
  const fog = useMemo(() => new THREE.FogExp2(0x081018, 0.012), []);

  const gapX = gapCenterX();

  /* trace lines (final pose, static) */
  const traceLines = useMemo(
    () =>
      parts.map((p) => {
        const g = new THREE.BufferGeometry().setFromPoints(p.outline);
        const l = new THREE.Line(
          g,
          new THREE.LineBasicMaterial({
            color: "#bcd2e8",
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        l.frustumCulled = false;
        g.setDrawRange(0, 0);
        return l;
      }),
    [parts],
  );

  /* connection lines (densified for draw-on) */
  const connLines = useMemo(
    () =>
      journey.connections.map(([a, b]) => {
        const pts: THREE.Vector3[] = [];
        const SEG = 24;
        for (let s = 0; s <= SEG; s++) pts.push(a.clone().lerp(b, s / SEG));
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        g.setDrawRange(0, 0);
        const l = new THREE.Line(
          g,
          new THREE.LineBasicMaterial({
            color: "#cfe2f4",
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        l.frustumCulled = false;
        return l;
      }),
    [journey],
  );

  /* payload pulses along connections + lane pulses + the record */
  const sprites = useMemo(() => {
    const make = (scale: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          map: glowTex,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      m.scale.setScalar(scale);
      m.frustumCulled = false;
      return m;
    };
    return {
      payloads: Array.from({ length: 6 }, () => make(0.4)),
      lanePulses: Array.from({ length: 6 }, () => make(0.5)),
      record: make(0.9),
    };
  }, [glowTex]);

  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      p: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      s: new THREE.Vector3(),
      c: new THREE.Color(),
      corridorEmissiveA: new THREE.Color("#2a4a68"),
      corridorEmissiveB: new THREE.Color("#dfe8f2"),
      baseQ: new THREE.Quaternion(),
      staticDone: false,
    }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    scene.background = BG;
    scene.fog = fog;
    fog.density = chan.fog;

    /* --- signal --- */
    if (signalRef.current) {
      const pulse = 0.82 + Math.sin(t * 2.4) * 0.18;
      const sMesh = signalRef.current;
      const stretched = smoothstep(chan.stretch);
      sMesh.scale.set(
        0.34 * (1 + stretched * 32) * (chan.stretch > 0.02 ? 1 : pulse),
        0.34 * Math.max(1 - stretched * 0.95, 0.05),
        1,
      );
      const mat = sMesh.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - smoothstep(chan.trace)) * (0.55 + pulse * 0.35);
      sMesh.visible = mat.opacity > 0.01;
      sMesh.position.x = cinema.pointerX * 0.09;
      sMesh.position.y = 0.12 + cinema.pointerY * 0.06;
    }

    /* --- outline trace --- */
    const seg = 1 / traceLines.length;
    traceLines.forEach((line, i) => {
      const local = clamp01((chan.trace - i * seg * 0.8) / seg);
      const total = parts[i].outline.length;
      const count = local <= 0 ? 0 : Math.max(2, Math.round(local * total));
      line.geometry.setDrawRange(0, count);
      const lm = line.material as THREE.LineBasicMaterial;
      lm.opacity =
        clamp01(chan.trace * 3) * (1 - smoothstep(chan.assembly)) * 0.85;
      line.visible = lm.opacity > 0.01;
    });

    /* --- K assembly --- */
    parts.forEach((p, i) => {
      const g = partRefs.current[i];
      if (!g) return;
      const span = 1 - p.assemblyDelay - 0.12;
      const local = smoothstep(
        clamp01((chan.assembly - p.assemblyDelay) / span),
      );
      g.position.set(
        p.position.x + p.assemblyFrom.x * (1 - local),
        p.position.y + p.assemblyFrom.y * (1 - local),
        p.position.z,
      );
      g.rotation.z = p.rotationZ + p.assemblyFrom.rz * (1 - local);
      g.visible = local > 0.001 && chan.kFade > 0.01;
    });
    kMat.opacity = smoothstep(chan.assembly) * chan.kFade;
    /* a fading K must not punch a depth hole through the world behind it */
    kMat.depthWrite = kMat.opacity > 0.9;

    /* --- lighting --- */
    const glow = chan.glow;
    if (keyLight.current) keyLight.current.intensity = 0.1 + glow * 1.6;
    if (rimA.current) rimA.current.intensity = glow * 1.6;
    if (rimB.current) rimB.current.intensity = glow * 0.5;
    if (seam.current)
      seam.current.intensity = glow * 0.35 + chan.machine * 1.4;
    if (corridorLight.current)
      corridorLight.current.intensity =
        chan.corridor * 0.5 * (1 - chan.reorg) + chan.machine * 0.4;
    if (roomLight.current) {
      /* a soft light travelling with the camera through the built zones */
      roomLight.current.intensity =
        chan.software * 0.5 + chan.network * 0.35 + chan.machine * 0.4;
      roomLight.current.position.set(0, 1.6, chan.camZ - 7);
    }

    /* --- beam --- */
    if (beamRef.current) {
      const bm = beamRef.current.material as THREE.MeshBasicMaterial;
      bm.opacity = chan.beam * 0.55;
      beamRef.current.visible = bm.opacity > 0.01;
      beamRef.current.position.set(0, 1.2, chan.beamZ);
      beamRef.current.scale.set(0.5 + chan.beam * 1.1, 11, 1);
    }
    if (beamLight.current) {
      beamLight.current.intensity = chan.beam * 2.4;
      beamLight.current.position.set(0, 1.2, chan.beamZ);
    }

    /* --- corridor → lattice morph --- */
    const active =
      chan.beam > 0.005 ||
      chan.reorg > 0.005 ||
      chan.network > 0.005 ||
      chan.machine > 0.005;
    if (corridorRef.current && corridorMat.current) {
      const mesh = corridorRef.current;
      mesh.visible = chan.corridor > 0.01 || chan.reorg > 0.01;

      corridorMat.current.emissiveIntensity =
        chan.corridor * (1 - chan.reorg * 0.45) * 1.0 +
        chan.reorg * (0.3 + chan.software * 0.15 + chan.network * 0.5) +
        chan.machine * 0.7;
      corridorMat.current.emissive
        .copy(tmp.corridorEmissiveA)
        .lerp(tmp.corridorEmissiveB, chan.reorg);
      uReorg.value = chan.reorg;

      if (active || !tmp.staticDone) {
        const { m, p, q, e, s } = tmp;
        journey.data.forEach((d, i) => {
          const w = smoothstep(clamp01((chan.beamZ - d.z) / 5));
          const local = w * chan.reorg;
          const k1 = smoothstep(clamp01(local * 2));
          const k2 = smoothstep(clamp01(local * 2 - 1));

          /* position: base → mid → target(A↔B) */
          p.copy(d.basePos).lerp(d.midPos, k1);
          const tx = lerp(d.targetA.x, d.targetB.x, chan.reflow);
          let ty = lerp(d.targetA.y, d.targetB.y, chan.reflow);
          const tz = lerp(d.targetA.z, d.targetB.z, chan.reflow);
          if (d.kind === "node") {
            ty +=
              Math.sin(t * 2.6 + d.phase) *
              0.07 *
              chan.network *
              (1 - chan.connect);
          }
          p.set(lerp(p.x, tx, k2), lerp(p.y, ty, k2), lerp(p.z, tz, k2));

          /* rotation */
          e.set(
            lerp(lerp(0, d.midRot.x, k1), d.targetRot.x, k2),
            lerp(lerp(d.baseRy, d.midRot.y, k1), d.targetRot.y, k2),
            lerp(lerp(0, d.midRot.z, k1), d.targetRot.z, k2),
          );
          q.setFromEuler(e);

          /* scale — sinking fragments dissolve to nothing as they reorganise;
             lattice nodes hold back until the automation chapter calls them */
          const ms = 1 - k1 * 0.45;
          if (d.sink) {
            const sv = Math.max(ms * (1 - k2), 0.001);
            s.set(sv, sv, sv);
          } else {
            const arrive =
              d.kind === "node" ? 0.04 + 0.96 * smoothstep(chan.network) : 1;
            s.set(
              lerp(ms, d.targetScale.x * arrive, k2),
              lerp(ms, d.targetScale.y * arrive, k2),
              lerp(ms, d.targetScale.z * arrive, k2),
            );
          }

          m.compose(p, q, s);
          mesh.setMatrixAt(i, m);
        });
        mesh.instanceMatrix.needsUpdate = true;
        tmp.staticDone = !active;
      }
    }

    /* --- the exhibition: each screen takes the light as you reach it --- */
    const galleryPresence = Math.max(chan.software, chan.machine * 0.85);
    gallery.screens.forEach((sc) => {
      const vis = galleryPresence > 0.02;
      sc.group.visible = vis;
      if (!vis) return;
      sc.group.position.y = sc.baseY + Math.sin(t * 0.7 + sc.phase) * 0.03;
      /* spotlight: peaks while the screen is ~3.5 units ahead of the camera.
         Out-of-focus works stay clearly readable — the light adds emphasis,
         never existence. */
      const dist = sc.z - chan.camZ; /* negative while still ahead */
      const focus = Math.exp(-Math.pow(dist + 3.5, 2) / 28);
      const level = clamp01(galleryPresence) * (0.42 + 0.58 * focus);
      sc.mats.forEach((m2, mi) => {
        m2.opacity = clamp01(galleryPresence * 1.15);
        /* the backing slab keeps its dark body; faces take the light */
        if (mi > 0) m2.color.setScalar(0.55 + 0.45 * level);
      });
    });

    /* --- software behaviours --- */
    const soft = chan.software;
    sprites.record.visible = soft > 0.01;
    if (soft > 0.01) {
      const rp = journey.curve.getPoint(clamp01(chan.record));
      sprites.record.position.copy(rp);
      (sprites.record.material as THREE.MeshBasicMaterial).opacity =
        soft * 0.9;
      sprites.record.quaternion.copy(camera.quaternion);
    }
    sprites.lanePulses.forEach((sp, i) => {
      const vis = soft > 0.01;
      sp.visible = vis;
      if (!vis) return;
      const lane = i % 3;
      const frac = (chan.record * 2 + i * 0.37) % 1;
      sp.position.set(
        (lane - 1) * 1.35,
        FLOOR_Y + 0.35,
        -30 - frac * 24,
      );
      (sp.material as THREE.MeshBasicMaterial).opacity = soft * 0.5;
      sp.quaternion.copy(camera.quaternion);
    });

    /* --- network connections --- */
    const nseg = 1 / connLines.length;
    connLines.forEach((line, i) => {
      const local = clamp01((chan.connect - i * nseg * 0.7) / nseg);
      const total = 25;
      line.geometry.setDrawRange(
        0,
        local <= 0 ? 0 : Math.max(2, Math.round(local * total)),
      );
      const lm = line.material as THREE.LineBasicMaterial;
      lm.opacity =
        (chan.network * 0.95 + chan.machine * 0.3) *
        clamp01(chan.connect * 4);
      line.visible = lm.opacity > 0.01;
    });
    sprites.payloads.forEach((sp, i) => {
      const li = i % connLines.length;
      const reach = clamp01(chan.connect * 1.3 - li * 0.08);
      const vis = chan.network > 0.01 && reach > 0.05;
      sp.visible = vis;
      if (!vis) return;
      const [a, b] = journey.connections[li];
      const frac = (chan.connect * 2.2 + i * 0.41) % 1;
      sp.position.lerpVectors(a, b, frac);
      (sp.material as THREE.MeshBasicMaterial).opacity =
        reach * 0.95 * chan.network;
      sp.quaternion.copy(camera.quaternion);
    });

    /* --- camera --- */
    const aspect = state.size.width / state.size.height;
    const portrait = aspect < 0.8;
    const cam = camera as THREE.PerspectiveCamera;
    const wantFov = portrait ? 54 : 38;
    if (Math.abs(cam.fov - wantFov) > 0.01) {
      cam.fov = wantFov;
      cam.updateProjectionMatrix();
    }
    /* inside the gap there is no room for cursor parallax */
    const nearGap = clamp01(1 - Math.abs(chan.camZ + 0.5) / 3);
    const px = cinema.pointerX * 0.16 * (1 - nearGap);
    const py = cinema.pointerY * 0.1 * (1 - nearGap);
    cam.position.x += (chan.camX + px - cam.position.x) * 0.07;
    cam.position.y += (chan.camY + py - cam.position.y) * 0.07;
    cam.position.z = chan.camZ;
    cam.lookAt(chan.camX * 0.85, chan.camY * 0.6, chan.camZ - 8);

    if (!cinema.ready) {
      cinema.ready = true;
      // window is a guaranteed singleton even if HMR duplicates modules
      (window as unknown as { __kivotraReady?: boolean }).__kivotraReady = true;
    }
  });

  return (
    <>
      {/* lights */}
      <ambientLight intensity={0.035} />
      <directionalLight ref={keyLight} position={[4, 7, 6]} color="#e8eef6" />
      <directionalLight ref={rimA} position={[-6, 2.5, -5]} color="#9bb8d4" />
      <directionalLight ref={rimB} position={[6, -1, -5]} color="#8b87c6" />
      <pointLight
        ref={seam}
        position={[gapX, 0.2, 0.5]}
        color="#9bb8d4"
        distance={3.5}
        decay={2}
      />
      <directionalLight
        ref={corridorLight}
        position={[0, 8, -24]}
        color="#a8c4de"
        intensity={0}
      />
      <pointLight
        ref={beamLight}
        color="#cfe2f4"
        distance={16}
        decay={2}
        intensity={0}
      />
      <pointLight
        ref={roomLight}
        color="#9fbcd8"
        distance={22}
        decay={1.8}
        intensity={0}
      />

      {/* signal */}
      <mesh ref={signalRef} position={[0, 0.12, 2.6]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* the beam */}
      <mesh ref={beamRef} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTex}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* outline trace */}
      {traceLines.map((l, i) => (
        <primitive key={`line-${i}`} object={l} />
      ))}

      {/* connections + pulses + record */}
      {connLines.map((l, i) => (
        <primitive key={`conn-${i}`} object={l} />
      ))}
      {sprites.payloads.map((s2, i) => (
        <primitive key={`payload-${i}`} object={s2} />
      ))}
      {sprites.lanePulses.map((s2, i) => (
        <primitive key={`lane-${i}`} object={s2} />
      ))}
      <primitive object={sprites.record} />

      {/* the 3D gallery of concept sites */}
      {gallery.screens.map((sc, i) => (
        <primitive key={`screen-${i}`} object={sc.group} />
      ))}

      {/* the K */}
      {parts.map((p, i) => (
        <group
          key={`part-${i}`}
          ref={(el) => {
            partRefs.current[i] = el;
          }}
          visible={false}
        >
          <mesh geometry={p.geometry} material={kMat} />
        </group>
      ))}

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, -10]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial
          color="#030406"
          metalness={0.2}
          roughness={0.6}
          envMapIntensity={0.06}
        />
      </mesh>

      {/* the journey's matter: corridor modules → lattice */}
      <instancedMesh
        ref={(el) => {
          corridorRef.current = el;
          if (el) {
            el.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            /* instances travel far from the base geometry's bounds —
               a stale bounding sphere would cull the whole world */
            el.frustumCulled = false;
          }
        }}
        args={[moduleGeo, undefined, journey.data.length]}
        visible={false}
      >
        <meshStandardMaterial
          ref={corridorMat}
          color="#0a0f16"
          metalness={0.55}
          roughness={0.48}
          emissive="#2a4a68"
          emissiveMap={atlasTex}
          emissiveIntensity={0}
          envMapIntensity={0.25}
        />
      </instancedMesh>
    </>
  );
}
