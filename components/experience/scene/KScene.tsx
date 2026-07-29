"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { filmProgress } from "@/lib/experience/progress";
import {
  BEATS,
  span,
  track,
  lerp,
  fadeWindow,
  easeOutCubic,
  easeInQuad,
  easeInOutCubic,
} from "@/lib/experience/timeline";
import type { Tier } from "@/lib/experience/quality";
import { K3D } from "@/lib/experience/k-geometry";

/* ------------------------------------------------------------------ */
/* The K is built around the signal: a thin vertical light that becomes
   the machined gap between its stem and arms. All geometry derives from
   the Concept D letterform in lib/experience/k-geometry — the 3D hero,
   the flat mark and the favicon are the same construction.            */
/* ------------------------------------------------------------------ */

const ACCENT = "#4d7cfe";
const SIGNAL = "#c3d4ff";
const BG = "#050607";

/* ------------------------------------------------------------------ */

function useGlassMaterial() {
  return useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d7dce8"),
      metalness: 0,
      roughness: 0.12,
      transmission: 1,
      thickness: 0.7,
      ior: 1.5,
      attenuationColor: new THREE.Color("#8892aa"),
      attenuationDistance: 2.6,
      clearcoat: 1,
      clearcoatRoughness: 0.22,
      envMapIntensity: 2.2,
      iridescence: 0.18,
      iridescenceIOR: 1.3,
    });
    return m;
  }, []);
}

function useMetalMaterial() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1c2028"),
        metalness: 0.92,
        roughness: 0.32,
        envMapIntensity: 1.7,
      }),
    []
  );
}

function useGlowMaterial() {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(SIGNAL) },
          uOpacity: { value: 0.5 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float d = length((vUv - 0.5) * 2.0);
            float a = pow(max(0.0, 1.0 - d), 2.4);
            gl_FragColor = vec4(uColor, a * uOpacity);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    []
  );
}

/** Microscopic machined components suspended inside a glass bar. */
function BarInternals({
  count,
  size,
  rotation = 0,
  center,
  material,
  geometry,
}: {
  count: number;
  size: [number, number, number];
  rotation?: number;
  center: [number, number, number];
  material: THREE.Material;
  geometry: THREE.BufferGeometry;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const rot = new THREE.Matrix4().makeRotationZ(rotation);
    for (let i = 0; i < count; i++) {
      const local = new THREE.Vector3(
        (Math.random() - 0.5) * size[0] * 0.66,
        (Math.random() - 0.5) * size[1] * 0.9,
        (Math.random() - 0.5) * size[2] * 0.66
      ).applyMatrix4(rot);
      dummy.position.set(
        center[0] + local.x,
        center[1] + local.y,
        center[2] + local.z
      );
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        rotation
      );
      dummy.scale.setScalar(0.5 + Math.random() * 1.1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, rotation, size, center]);

  return <instancedMesh ref={ref} args={[geometry, material, count]} />;
}

/* ------------------------------------------------------------------ */

export default function KScene({
  tier,
  onReady,
}: {
  tier: Tier;
  onReady: () => void;
}) {
  // Only base-Camera members (position, lookAt) are used — no narrowing needed.
  const camera = useThree((s) => s.camera);
  const distMul = tier === "mobile" ? 1.5 : 1;
  const kScale = tier === "mobile" ? 0.85 : 1;
  const internalCount = tier === "mobile" ? 30 : 60;

  const glass = useGlassMaterial();
  const metal = useMetalMaterial();
  const glow = useGlowMaterial();

  const internalsMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1b1f28"),
        metalness: 0.9,
        roughness: 0.4,
        transparent: true,
        opacity: 0,
        envMapIntensity: 0.9,
      }),
    []
  );
  const internalsGeometry = useMemo(
    () => new THREE.BoxGeometry(0.05, 0.05, 0.05),
    []
  );

  const lineMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(SIGNAL),
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
      }),
    []
  );

  const corridorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#232a36"),
        metalness: 0.25,
        roughness: 0.75,
        transparent: true,
        opacity: 0,
      }),
    []
  );

  const hairlineMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#c7d6ff"),
        transparent: true,
        opacity: 0,
        toneMapped: false,
      }),
    []
  );

  /* Corridor teaser: two rows of identical slabs vanishing into fog. */
  const corridorRef = useRef<THREE.InstancedMesh>(null);
  const corridorGeometry = useMemo(
    () => new THREE.BoxGeometry(1.35, 2.4, 0.07),
    []
  );
  useEffect(() => {
    const mesh = corridorRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let z = -9; z >= -30; z -= 2.1) {
      for (const x of [-1.75, 1.75]) {
        dummy.position.set(x, 0, z);
        dummy.rotation.set(0, x > 0 ? -0.12 : 0.12, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  /* Animated refs — every state below is a pure function of progress. */
  const kGroup = useRef<THREE.Group>(null);
  const stemGroup = useRef<THREE.Group>(null);
  const armUpperGroup = useRef<THREE.Group>(null);
  const armLowerGroup = useRef<THREE.Group>(null);
  const capTop = useRef<THREE.Mesh>(null);
  const capBottom = useRef<THREE.Mesh>(null);
  const capArmUpper = useRef<THREE.Mesh>(null);
  const capArmLower = useRef<THREE.Mesh>(null);
  const lineMesh = useRef<THREE.Mesh>(null);
  const lineCapTop = useRef<THREE.Mesh>(null);
  const lineCapBottom = useRef<THREE.Mesh>(null);
  const glowMesh = useRef<THREE.Mesh>(null);
  const gapLight = useRef<THREE.PointLight>(null);
  const hairlineRef = useRef<THREE.Mesh>(null);

  const pointerCur = useRef({ x: 0, y: 0 });
  const readySent = useRef(false);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const rimLight = useRef<THREE.PointLight>(null);
  const corridorLight = useRef<THREE.PointLight>(null);
  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#07080a"),
        metalness: 0.55,
        roughness: 0.42,
        envMapIntensity: 0.5,
        transparent: true,
        opacity: 0,
      }),
    []
  );

  /* R3F does not dispose resources created imperatively via useMemo —
     release them ourselves when the scene unmounts. */
  useEffect(() => {
    return () => {
      for (const r of [
        glass,
        metal,
        glow,
        internalsMaterial,
        lineMaterial,
        corridorMaterial,
        hairlineMaterial,
        internalsGeometry,
        corridorGeometry,
        floorMaterial,
      ]) {
        r.dispose();
      }
    };
  }, [
    glass,
    metal,
    glow,
    internalsMaterial,
    lineMaterial,
    corridorMaterial,
    hairlineMaterial,
    internalsGeometry,
    corridorGeometry,
    floorMaterial,
  ]);

  useFrame((state) => {
    const f = filmProgress.get();
    const t = state.clock.elapsedTime;

    if (!readySent.current) {
      readySent.current = true;
      onReady();
    }

    /* -- pointer: slow, heavy optical response ----------------------- */
    const p = pointerCur.current;
    p.x = lerp(p.x, state.pointer.x, 0.05);
    p.y = lerp(p.y, state.pointer.y, 0.05);

    /* -- camera ------------------------------------------------------ */
    const camZ =
      f < 0.4
        ? track(f, 0, 0.4, 12, 7.2) * distMul
        : f < 0.62
          ? track(f, 0.4, 0.62, 7.2, 4.3) * distMul
          : f < BEATS.passThrough[0]
            ? track(f, 0.62, BEATS.passThrough[0], 4.3, 2.5) * distMul
            : track(
                f,
                BEATS.passThrough[0],
                1,
                2.5 * distMul,
                -7.5,
                easeInQuad
              );

    // The letterform's visual centre sits right of the gap axis (x = 0).
    // The framing follows the story: centre the lone signal first, drift to
    // the K's visual centre as it forms, then converge back onto the gap
    // axis for the pass-through.
    // While the headline and supporting statement hold (0.46–0.87), pan the
    // whole framing left so the K sits in the right half of the frame and
    // the type owns the left — they must never overlap.
    const editorialPan =
      -0.85 * fadeWindow(f, [0.42, 0.5, 0.8, 0.88]) * (tier === "mobile" ? 0.4 : 1);
    const frameX =
      K3D.visualCenterX *
        kScale *
        span(f, 0.36, 0.52) *
        (1 - span(f, 0.72, 0.86)) +
      editorialPan;

    // one graceful orbital arc during formation, straight for the pass
    const orbit = Math.sin(span(f, 0.3, BEATS.passThrough[0]) * Math.PI);
    camera.position.set(frameX + orbit * 0.8, orbit * 0.25, camZ);

    const parallax = 0.4 * (1 - span(f, 0.82, 0.92));
    const targetZ = -track(f, 0.82, 0.92, 0, 30);
    camera.lookAt(
      frameX + p.x * parallax,
      p.y * parallax * 0.6,
      targetZ
    );

    /* -- signal: point → engineered line → the K's gap --------------- */
    const pulse = Math.sin(t * 2.4) * 0.5 + 0.5;
    const early = 1 - span(f, 0.34, 0.44); // pulse belongs to the opening
    const lineH = track(
      f,
      BEATS.lineStretch[0],
      BEATS.lineStretch[1],
      0.022,
      K3D.signal.height,
      easeInOutCubic
    );
    const lineFade = 1 - span(f, 0.85, 0.9); // hand off to the corridor

    if (lineMesh.current) {
      lineMesh.current.scale.set(1, lineH / 0.02, 1);
      lineMaterial.opacity = (0.65 + 0.3 * pulse * early) * lineFade;
    }
    if (glowMesh.current) {
      glowMesh.current.scale.set(
        0.55 + lineH * 0.16,
        0.62 + lineH * 0.5,
        1
      );
      glow.uniforms.uOpacity.value =
        (0.34 + 0.22 * pulse * early) * lineFade;
    }
    const lineCapScale = span(f, 0.3, 0.38);
    for (const [ref, dir] of [
      [lineCapTop, 1],
      [lineCapBottom, -1],
    ] as const) {
      if (ref.current) {
        ref.current.position.y = dir * (lineH / 2 + 0.03);
        ref.current.scale.setScalar(Math.max(0.0001, lineCapScale));
      }
    }
    if (gapLight.current) {
      const flare = Math.sin(span(f, 0.84, 0.94) * Math.PI) * 2.2;
      gapLight.current.intensity =
        0.25 + span(f, 0.24, 0.4) * 0.8 + flare;
    }

    /* -- motivated lighting: the studio lights come up as the machine
          forms; the entry stays almost completely black ---------------- */
    const lightRise = span(f, 0.36, 0.56);
    if (keyLight.current) {
      keyLight.current.intensity = 0.05 + lightRise * 1.35;
    }
    if (rimLight.current) {
      rimLight.current.intensity = lightRise * 2.4;
    }
    floorMaterial.opacity = lightRise * 0.55;

    /* -- formation: parts slide onto the signal axis ------------------ */
    const partsVisible = f > 0.34;
    for (const g of [stemGroup, armUpperGroup, armLowerGroup]) {
      if (g.current) g.current.visible = partsVisible;
    }
    if (stemGroup.current) {
      stemGroup.current.position.x = track(
        f,
        BEATS.stemIn[0],
        BEATS.stemIn[1],
        -6,
        0,
        easeOutCubic
      );
    }
    if (armUpperGroup.current) {
      armUpperGroup.current.position.x = track(
        f,
        BEATS.armUpperIn[0],
        BEATS.armUpperIn[1],
        5,
        0,
        easeOutCubic
      );
    }
    if (armLowerGroup.current) {
      armLowerGroup.current.position.x = track(
        f,
        BEATS.armLowerIn[0],
        BEATS.armLowerIn[1],
        5,
        0,
        easeOutCubic
      );
    }
    const capScale = Math.max(
      0.0001,
      track(f, BEATS.capsIn[0], BEATS.capsIn[1], 0, 1, easeOutCubic)
    );
    for (const ref of [capTop, capBottom, capArmUpper, capArmLower]) {
      if (ref.current) ref.current.scale.setScalar(capScale);
    }
    internalsMaterial.opacity = track(
      f,
      BEATS.internalsIn[0],
      BEATS.internalsIn[1],
      0,
      0.85
    );

    /* -- assembled machine: barely-alive idle ------------------------ */
    if (kGroup.current) {
      kGroup.current.rotation.y =
        Math.sin(t * 0.22) * 0.02 * span(f, 0.72, 0.8);
      kGroup.current.scale.setScalar(kScale);
    }

    /* -- Chapter 03 suggestion: the corridor of sameness -------------- */
    const corridorIn = span(
      f,
      BEATS.corridorReveal[0],
      BEATS.corridorReveal[1]
    );
    corridorMaterial.opacity = corridorIn * 0.92;
    hairlineMaterial.opacity = corridorIn;
    if (hairlineRef.current) {
      hairlineRef.current.scale.x = 0.4 + corridorIn * 0.6;
    }
    if (corridorLight.current) {
      corridorLight.current.intensity = corridorIn * 3.2;
    }
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fogExp2 attach="fog" args={[BG, 0.035]} />

      <ambientLight intensity={0.04} />
      <directionalLight
        ref={keyLight}
        position={[3.5, 4, 2.5]}
        intensity={0.05}
        color="#e8eeff"
      />
      <pointLight
        ref={gapLight}
        position={[0, 0, 0.5]}
        color={ACCENT}
        intensity={0.25}
        distance={7}
        decay={2}
      />
      {/* cool rim from behind-left — separates the smoked glass from the void */}
      <pointLight
        ref={rimLight}
        position={[-2.6, 1.8, -2.8]}
        color="#aebcdf"
        intensity={0}
        distance={12}
        decay={2}
      />

      {/* Local, network-free studio environment for reflections */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={2.1}
          position={[4, 3, 3]}
          scale={[3, 3, 1]}
          color="#dfe6f2"
        />
        <Lightformer
          intensity={1.1}
          position={[-4, 1.5, -2]}
          rotation-y={Math.PI}
          scale={[2, 4, 1]}
          color="#8ea2c8"
        />
        <Lightformer
          intensity={0.7}
          position={[0, -3, 2]}
          scale={[5, 1, 1]}
          color="#5c6a8a"
        />
        {/* faint frontal fill so glass faces carry a readable sheen */}
        <Lightformer
          intensity={0.32}
          position={[0, 0.5, 7]}
          scale={[11, 8, 1]}
          color="#39415a"
        />
      </Environment>

      {/* ---- The K ---- */}
      <group ref={kGroup}>
        {/* signal line — the machine's core, later its machined gap */}
        <mesh ref={lineMesh}>
          <boxGeometry args={[0.014, 0.02, 0.014]} />
          <primitive object={lineMaterial} attach="material" />
        </mesh>
        <mesh ref={glowMesh}>
          <planeGeometry args={[1, 1]} />
          <primitive object={glow} attach="material" />
        </mesh>
        <mesh ref={lineCapTop} material={metal}>
          <boxGeometry args={[0.06, 0.025, 0.06]} />
        </mesh>
        <mesh ref={lineCapBottom} material={metal}>
          <boxGeometry args={[0.06, 0.025, 0.06]} />
        </mesh>

        {/* stem — slides in from the left */}
        <group ref={stemGroup}>
          <RoundedBox
            args={K3D.stem.size}
            radius={0.028}
            smoothness={4}
            position={K3D.stem.center}
            material={glass}
          />
          {/* machined rails on the stem's gap-facing face */}
          <mesh position={[K3D.railX, 0, 0.22]} material={metal}>
            <boxGeometry args={[0.025, K3D.bodyHeight, 0.025]} />
          </mesh>
          <mesh position={[K3D.railX, 0, -0.22]} material={metal}>
            <boxGeometry args={[0.025, K3D.bodyHeight, 0.025]} />
          </mesh>
          <mesh
            ref={capTop}
            position={[K3D.stem.center[0], K3D.bodyHeight / 2 + 0.05, 0]}
            material={metal}
          >
            <boxGeometry args={[K3D.stem.size[0] + 0.06, 0.09, 0.56]} />
          </mesh>
          <mesh
            ref={capBottom}
            position={[K3D.stem.center[0], -(K3D.bodyHeight / 2 + 0.05), 0]}
            material={metal}
          >
            <boxGeometry args={[K3D.stem.size[0] + 0.06, 0.09, 0.56]} />
          </mesh>
          <BarInternals
            count={internalCount}
            size={K3D.stem.size}
            center={K3D.stem.center}
            material={internalsMaterial}
            geometry={internalsGeometry}
          />
        </group>

        {/* arms — slide in from the right, staggered */}
        <group ref={armUpperGroup}>
          <RoundedBox
            args={K3D.arm.size}
            radius={0.028}
            smoothness={4}
            position={K3D.arm.upperCenter}
            rotation={[0, 0, -K3D.armAngle]}
            material={glass}
          />
          <mesh
            ref={capArmUpper}
            position={K3D.arm.upperTip}
            rotation={[0, 0, -K3D.armAngle]}
            material={metal}
          >
            <boxGeometry args={[K3D.arm.size[0] + 0.05, 0.08, 0.54]} />
          </mesh>
          <BarInternals
            count={Math.round(internalCount * 0.66)}
            size={K3D.arm.size}
            rotation={-K3D.armAngle}
            center={K3D.arm.upperCenter}
            material={internalsMaterial}
            geometry={internalsGeometry}
          />
        </group>
        <group ref={armLowerGroup}>
          <RoundedBox
            args={K3D.arm.size}
            radius={0.028}
            smoothness={4}
            position={K3D.arm.lowerCenter}
            rotation={[0, 0, K3D.armAngle]}
            material={glass}
          />
          <mesh
            ref={capArmLower}
            position={K3D.arm.lowerTip}
            rotation={[0, 0, K3D.armAngle]}
            material={metal}
          >
            <boxGeometry args={[K3D.arm.size[0] + 0.05, 0.08, 0.54]} />
          </mesh>
          <BarInternals
            count={Math.round(internalCount * 0.66)}
            size={K3D.arm.size}
            rotation={K3D.armAngle}
            center={K3D.arm.lowerCenter}
            material={internalsMaterial}
            geometry={internalsGeometry}
          />
        </group>
      </group>

      {/* ---- floor: faint sheen fading up with the lights ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, -20]}>
        <planeGeometry args={[120, 160]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* ---- Chapter 03 teaser: sameness, receding into fog ---- */}
      <instancedMesh
        ref={corridorRef}
        args={[corridorGeometry, corridorMaterial, 24]}
      />
      {/* cool light deep in the corridor — the destination the exit implies */}
      <pointLight
        ref={corridorLight}
        position={[0, 0.4, -20]}
        color="#8fa6dd"
        intensity={0}
        distance={26}
        decay={1.6}
      />
      <mesh ref={hairlineRef} position={[0, 0, -34]}>
        <boxGeometry args={[3.4, 0.035, 0.035]} />
        <primitive object={hairlineMaterial} attach="material" />
      </mesh>
    </>
  );
}
