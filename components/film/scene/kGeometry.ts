import * as THREE from "three";

/**
 * The Kivotra K — disconnected-chevron construction (canonical frame:
 * docs/art/hero-k-front_R2c.png). A tall stem slab, an open air gap with no
 * bridge, and two diagonal bars meeting at mid-height pointing left.
 * All numbers in world units; the K stands on the floor at y = -H/2.
 */

export const K = {
  stemW: 1.0,
  stemH: 4.6,
  depth: 0.5,
  gapW: 0.28,
  barLen: 2.95,
  barT: 0.78,
  barAngle: (56 * Math.PI) / 180,
};

const bevel = {
  bevelEnabled: true,
  bevelThickness: 0.018,
  bevelSize: 0.018,
  bevelSegments: 2,
};

function slab(w: number, h: number, depth: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -h / 2);
  s.lineTo(w / 2, -h / 2);
  s.lineTo(w / 2, h / 2);
  s.lineTo(-w / 2, h / 2);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, ...bevel });
  g.translate(0, 0, -depth / 2);
  return g;
}

export interface KPart {
  geometry: THREE.ExtrudeGeometry;
  position: THREE.Vector3;
  rotationZ: number;
  /** loop of outline points (world space, final pose) for the trace lines */
  outline: THREE.Vector3[];
  /** where the part slides in from during assembly */
  assemblyFrom: { x: number; y: number; rz: number };
  assemblyDelay: number;
}

/** Densify a closed polygon loop so the trace draws on smoothly. */
function densifyLoop(corners: [number, number][]): THREE.Vector3[] {
  const SEG = 12;
  const pts: THREE.Vector3[] = [];
  for (let e = 0; e < corners.length; e++) {
    const [ax, ay] = corners[e];
    const [bx, by] = corners[(e + 1) % corners.length];
    for (let s = 0; s < SEG; s++) {
      const t = s / SEG;
      pts.push(new THREE.Vector3(ax + (bx - ax) * t, ay + (by - ay) * t, 0));
    }
  }
  pts.push(new THREE.Vector3(corners[0][0], corners[0][1], 0));
  return pts;
}

function polygonGeometry(
  corners: [number, number][],
  depth: number,
): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(corners[0][0], corners[0][1]);
  for (let i = 1; i < corners.length; i++) s.lineTo(corners[i][0], corners[i][1]);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, ...bevel });
  g.translate(0, 0, -depth / 2);
  return g;
}

/**
 * Build the two parts of the K in their final pose: the stem slab and one
 * mitred chevron. The chevron is a single polygon — vertical cut along the
 * gap line, notch vertex at mid-height — so both the solid and the traced
 * outline are the true silhouette, with no internal edges.
 */
export function buildKParts(): KPart[] {
  const { stemW, stemH, depth, gapW, barLen, barT, barAngle } = K;

  const stemX = -(gapW / 2 + stemW / 2) - 0.14;
  const gapEdge = stemX + stemW / 2 + gapW; // right edge of the air gap

  const cos = Math.cos(barAngle);
  const sin = Math.sin(barAngle);
  const x0 = gapEdge; // chevron's vertical left edge
  const yEdge = barT / cos; // where a bar's outer edge meets the gap line

  /* chevron outline, clockwise:
     top gap corner → upper bar top-outer → upper bar bottom-outer →
     notch vertex → lower bar top-outer → lower bar bottom-outer → bottom gap corner */
  const chevronCorners: [number, number][] = [
    [x0, yEdge],
    [x0 + barLen * cos - barT * sin, barLen * sin + barT * cos],
    [x0 + barLen * cos, barLen * sin],
    [x0, 0],
    [x0 + barLen * cos, -barLen * sin],
    [x0 + barLen * cos - barT * sin, -(barLen * sin + barT * cos)],
    [x0, -yEdge],
  ];

  const stemCorners: [number, number][] = [
    [stemX - stemW / 2, -stemH / 2],
    [stemX + stemW / 2, -stemH / 2],
    [stemX + stemW / 2, stemH / 2],
    [stemX - stemW / 2, stemH / 2],
  ];

  const stem: KPart = {
    geometry: slab(stemW, stemH, depth),
    position: new THREE.Vector3(stemX, 0, 0),
    rotationZ: 0,
    outline: densifyLoop(stemCorners),
    assemblyFrom: { x: -2.6, y: 0, rz: -0.06 },
    assemblyDelay: 0,
  };

  const chevron: KPart = {
    geometry: polygonGeometry(chevronCorners, depth),
    position: new THREE.Vector3(0, 0, 0),
    rotationZ: 0,
    outline: densifyLoop(chevronCorners),
    assemblyFrom: { x: 2.4, y: 0, rz: 0.08 },
    assemblyDelay: 0.3,
  };

  return [stem, chevron];
}

/** x of the open gap's centre — the camera passes through here. */
export function gapCenterX(): number {
  const { stemW, gapW } = K;
  const stemX = -(gapW / 2 + stemW / 2) - 0.14;
  return stemX + stemW / 2 + gapW / 2;
}
