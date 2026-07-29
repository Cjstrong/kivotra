"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chan, cinema, smoothstep, clamp01, lerp } from "@/lib/cinema";

/**
 * The Kivotra signature object.
 *
 * Not a letterform — a sculpture the K is read INTO: a split monolithic
 * spine, two precision-cut blades cantilevered off a negative-space hinge,
 * chrome joint pins, and one thin internal light channel inside the split.
 * The silhouette still scans as a K; the object reads as product design.
 *
 *   shell — smoked crystal (transmission, clearcoat)
 *   core  — brushed dark titanium, visible through the glass
 *   pins  — polished chrome
 *   channel — the only cyan, waking during transformations
 *
 * Unfold: the blades swing level to become the top/bottom structure, the
 * split spine becomes a split left rail, the light channel rides between.
 * The finale returns every part to these exact coordinates — the loop.
 *
 * ASSET REPLACEMENT POINT: swap extrusions for a sculpted Draco GLB, keeping
 * the five panel nodes and their assembled/frame transforms.
 */

type Pt = [number, number];

/* Split monolith — slim, chamfered ends */
const SPINE_TOP: Pt[] = [
  [-1.62, 0.18], [-0.92, 0.18], [-0.92, 2.3], [-1.62, 2.14],
];
const SPINE_BOT: Pt[] = [
  [-1.62, -2.14], [-0.92, -2.3], [-0.92, -0.16], [-1.62, -0.16],
];
/* Upper blade — tapered, floats 0.14 off the spine (the hinge gap) */
const WING_UP: Pt[] = [
  [-0.94, 0.55], [1.67, 2.17], [1.83, 1.93], [-0.63, 0.09],
];
/* Lower blade — longer, asymmetric balance */
const WING_DN: Pt[] = [
  [-0.95, -0.53], [-0.61, -0.03], [2.09, -2.08], [1.92, -2.32],
];

function shapeFrom(points: Pt[]): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) s.lineTo(points[i][0], points[i][1]);
  s.closePath();
  return s;
}
function centroid(points: Pt[]): Pt {
  let cx = 0, cy = 0;
  for (const [x, y] of points) { cx += x; cy += y; }
  return [cx / points.length, cy / points.length];
}

type Panel = {
  key: string;
  pts: Pt[];
  frame: [number, number, number];
  frameRz: number;
  span: [number, number];
  depth: number;
};

const PANELS: Panel[] = [
  { key: "wingUp", pts: WING_UP, frame: [0, 3.22, -0.5], frameRz: -0.56, span: [0.0, 0.6], depth: 0.34 },
  { key: "wingDn", pts: WING_DN, frame: [0, -3.22, -0.5], frameRz: 0.6, span: [0.15, 0.75], depth: 0.34 },
  { key: "spineTop", pts: SPINE_TOP, frame: [-5.15, 1.2, -0.5], frameRz: 0, span: [0.3, 0.92], depth: 0.5 },
  { key: "spineBot", pts: SPINE_BOT, frame: [-5.15, -1.2, -0.5], frameRz: 0, span: [0.38, 1.0], depth: 0.5 },
];

/* The light channel sits in the spine split; frame pose bridges the rails. */
const CHANNEL = { asm: [-1.27, 0.01, 0] as const, frame: [-5.15, 0, -0.4] as const, span: [0.32, 0.95] as const };
/* Chrome hinge pins — child offsets from each wing's centroid. */
const PIN_UP: Pt = [-0.85, 0.33];
const PIN_DN: Pt = [-0.85, -0.29];

function extrude(pts: Pt[], depth: number, bevel: number): THREE.ExtrudeGeometry {
  const g = new THREE.ExtrudeGeometry(shapeFrom(pts), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: 4,
    curveSegments: 6,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

const IS_MOBILE = () => typeof window !== "undefined" && window.innerWidth < 760;

export default function KModel() {
  const group = useRef<THREE.Group>(null);
  const nodes = useRef<(THREE.Group | null)[]>([]);
  const channelRef = useRef<THREE.Group>(null);
  const channelMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const pose = useMemo(() => {
    if (IS_MOBILE()) return { pos: [0, 0.98, 0] as const, scale: 0.66 };
    // Short landscape viewports (1280×800-class) get a smaller, higher pose
    // so the sculpture never collides with the headline zone.
    const short =
      typeof window !== "undefined" && window.innerHeight < 760;
    return short
      ? { pos: [0, 0.78, 0] as const, scale: 0.68 }
      : { pos: [0, 0.42, 0] as const, scale: 0.86 };
  }, []);

  const built = useMemo(
    () =>
      PANELS.map((p) => {
        const [cx, cy] = centroid(p.pts);
        const local = p.pts.map(([x, y]) => [x - cx, y - cy] as Pt);
        return {
          shell: extrude(local, p.depth, 0.045),
          core: extrude(local.map(([x, y]) => [x * 0.78, y * 0.78] as Pt), p.depth * 0.55, 0.015),
          asm: [cx, cy, 0] as [number, number, number],
        };
      }),
    []
  );

  const [shellMat, coreMat, pinMat] = useMemo(() => {
    const shell = new THREE.MeshPhysicalMaterial({
      color: "#2a3138",
      transmission: cinema.tier === "low" ? 0 : 0.55,
      thickness: 1.2,
      roughness: 0.06,
      ior: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      attenuationColor: "#12403c",
      attenuationDistance: 3.4,
      envMapIntensity: 2.4,
      transparent: true,
    });
    const core = new THREE.MeshStandardMaterial({
      color: "#3f474e",
      metalness: 1,
      roughness: 0.32,
      envMapIntensity: 1.5,
      transparent: true,
    });
    const pin = new THREE.MeshStandardMaterial({
      color: "#aeb6bd",
      metalness: 1,
      roughness: 0.12,
      envMapIntensity: 2,
      transparent: true,
    });
    return [shell, core, pin];
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g || cinema.paused) return;
    const dt = Math.min(delta, 1 / 30);

    const u = clamp01(chan.kUnfold);
    const parked = clamp01(chan.kParked);
    const present = smoothstep(1 - parked);
    g.visible = present > 0.01;

    const dim = lerp(1, 0.42, smoothstep(u)) * present;
    shellMat.opacity = dim * (cinema.tier === "low" ? 0.92 : 1);
    coreMat.opacity = dim;
    pinMat.opacity = dim;

    // still at rest: whisper of breath + small pointer lean, gone in motion
    const rest = (1 - u) * present;
    const lam = 1 - Math.exp(-3.2 * dt);
    g.rotation.y += (cinema.pointerX * 0.22 * rest - g.rotation.y) * lam;
    g.rotation.x += (-cinema.pointerY * 0.12 * rest - g.rotation.x) * lam;
    const breathe = 1 + Math.sin(performance.now() * 0.00035) * 0.006 * rest;
    g.scale.setScalar(pose.scale * breathe);

    PANELS.forEach((p, i) => {
      const node = nodes.current[i];
      if (!node) return;
      const local = smoothstep((u - p.span[0]) / (p.span[1] - p.span[0]));
      const asm = built[i].asm;
      const lift = Math.sin(local * Math.PI) * 0.5;
      node.position.set(
        lerp(asm[0], p.frame[0], local),
        lerp(asm[1], p.frame[1], local),
        lerp(asm[2], p.frame[2], local) + lift
      );
      node.rotation.z = lerp(0, p.frameRz, local);
    });

    const ch = channelRef.current;
    if (ch) {
      const local = smoothstep((u - CHANNEL.span[0]) / (CHANNEL.span[1] - CHANNEL.span[0]));
      ch.position.set(
        lerp(CHANNEL.asm[0], CHANNEL.frame[0], local),
        lerp(CHANNEL.asm[1], CHANNEL.frame[1], local),
        lerp(CHANNEL.asm[2], CHANNEL.frame[2], local)
      );
      // the system wakes while transforming; near-dormant at rest
      if (channelMatRef.current) {
        const active = Math.sin(clamp01(u) * Math.PI);
        channelMatRef.current.emissiveIntensity = 0.35 + active * 2.2;
        channelMatRef.current.opacity = dim;
      }
    }
  });

  return (
    <group ref={group} position={pose.pos as unknown as THREE.Vector3} scale={pose.scale}>
      {PANELS.map((p, i) => (
        <group
          key={p.key}
          ref={(el) => { nodes.current[i] = el; }}
          position={built[i].asm}
        >
          <mesh geometry={built[i].shell} material={shellMat} castShadow={cinema.tier === "high"} />
          <mesh geometry={built[i].core} material={coreMat} />
          {(p.key === "wingUp" || p.key === "wingDn") && (
            <mesh
              material={pinMat}
              position={[
                (p.key === "wingUp" ? PIN_UP[0] : PIN_DN[0]) - built[i].asm[0],
                (p.key === "wingUp" ? PIN_UP[1] : PIN_DN[1]) - built[i].asm[1],
                0,
              ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.05, 0.05, 0.5, 20]} />
            </mesh>
          )}
        </group>
      ))}

      {/* internal light channel — the only cyan on the object */}
      <group ref={channelRef} position={CHANNEL.asm as unknown as THREE.Vector3}>
        <mesh>
          <boxGeometry args={[0.56, 0.07, 0.26]} />
          <meshStandardMaterial
            ref={channelMatRef}
            color="#0c1514"
            emissive="#57e6da"
            emissiveIntensity={0.35}
            roughness={0.3}
            transparent
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}
