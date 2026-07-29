"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  RoundedBox,
} from "@react-three/drei";
import { filmProgress } from "@/lib/experience/progress";
import {
  BEATS,
  span,
  track,
  lerp,
  fadeWindow,
  easeInQuad,
  easeInOutCubic,
} from "@/lib/experience/timeline";
import type { Tier } from "@/lib/experience/quality";
import { K3D } from "@/lib/experience/k-geometry";

/* ------------------------------------------------------------------ */
/* The K is on stage from frame one — a rim-lit engineered object in a
   dark studio. Scroll performs the reveal: the key light and practicals
   come up in sequence, the machine powers on, the camera commits and
   passes through the signal gap. All geometry derives from the Concept D
   letterform in lib/experience/k-geometry.                             */
/* ------------------------------------------------------------------ */

const ACCENT = "#4d7cfe";
const SIGNAL = "#c3d4ff";
const BG = "#050607";

function useGlassMaterial() {
  return useMemo(() => {
    /* Ultra-clear optical glass (material study A): the body is water-clear
       and becomes luminous by refracting the practical strip lights behind
       it — lit by its environment, never blending into it. */
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ffffff"),
      metalness: 0,
      roughness: 0.09,
      transmission: 1,
      thickness: 0.55,
      ior: 1.52,
      attenuationColor: new THREE.Color("#dfe6f2"),
      attenuationDistance: 8,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 2.6,
      iridescence: 0.12,
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

/**
 * The machined core inside a glass bar: a precise central spine with evenly
 * spaced cross-ribs. Structured, deterministic — engineering, not debris.
 */
function BarCore({
  size,
  rotation = 0,
  center,
  material,
  ribGeometry,
}: {
  size: [number, number, number];
  rotation?: number;
  center: [number, number, number];
  material: THREE.Material;
  ribGeometry: THREE.BufferGeometry;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const length = size[1];
  // sparse station marks — watch-movement precision, never a radiator grille
  const ribCount = Math.max(4, Math.round(length / 0.55));

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const rot = new THREE.Matrix4().makeRotationZ(rotation);
    for (let i = 0; i < ribCount; i++) {
      const yLocal = (i / (ribCount - 1) - 0.5) * length * 0.86;
      const local = new THREE.Vector3(0, yLocal, 0).applyMatrix4(rot);
      dummy.position.set(
        center[0] + local.x,
        center[1] + local.y,
        center[2] + local.z
      );
      dummy.rotation.set(0, 0, rotation);
      // rib geometry has a 0.1 base footprint — scale to the bar section
      dummy.scale.set((size[0] * 0.42) / 0.1, 0.7, (size[2] * 0.42) / 0.1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [ribCount, rotation, size, center, length]);

  return (
    <>
      <mesh position={center} rotation={[0, 0, rotation]} material={material}>
        <boxGeometry args={[0.042, length * 0.9, 0.042]} />
      </mesh>
      <instancedMesh ref={ref} args={[ribGeometry, material, ribCount]} />
    </>
  );
}

/* ------------------------------------------------------------------ */

export default function KScene({
  tier,
  onReady,
}: {
  tier: Tier;
  onReady: () => void;
}) {
  const camera = useThree((s) => s.camera);
  const baseFov = tier === "mobile" ? 38 : 28;
  const passFov = tier === "mobile" ? 52 : 46;
  const distMul = tier === "mobile" ? 0.75 : 1;
  const kScale = tier === "mobile" ? 0.85 : 1;

  const glass = useGlassMaterial();
  const metal = useMetalMaterial();
  const glow = useGlowMaterial();
  /* separation pool: a dim cool radial behind the K so its dark silhouette
     always separates from the void — atmosphere, not bloom */
  const hazePool = useGlowMaterial();

  const internalsMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#14171d"),
        metalness: 0.9,
        roughness: 0.45,
        envMapIntensity: 0.5,
      }),
    []
  );
  const internalsGeometry = useMemo(
    () => new THREE.BoxGeometry(0.1, 0.016, 0.1),
    []
  );
  const pulseMesh = useRef<THREE.Mesh>(null);
  const pulseMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#eaf1ff"),
        transparent: true,
        opacity: 0,
        toneMapped: false,
      }),
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

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#07080a"),
        metalness: 0.55,
        roughness: 0.42,
        envMapIntensity: 0.5,
        transparent: true,
        opacity: 0.2,
      }),
    []
  );

  const practicalMaterial = useMemo(
    () =>
      // Opaque on purpose: transparent objects are excluded from the
      // transmission buffer, and the whole point of the practicals is to be
      // seen through the glass. Soft gradient rests on the background
      // colour, so an unlit practical is indistinguishable from the void.
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color("#dfe9ff") },
          uIntensity: { value: 0 },
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
          uniform float uIntensity;
          varying vec2 vUv;
          void main() {
            float x = pow(max(0.0, 1.0 - abs(vUv.x - 0.5) * 2.0), 2.4);
            float y = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
            vec3 bg = vec3(0.0196, 0.0235, 0.0275);
            gl_FragColor = vec4(bg + uColor * uIntensity * x * y, 1.0);
          }
        `,
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
        dummy.position.set(x, -0.56, z);
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
  const lineMesh = useRef<THREE.Mesh>(null);
  const glowMesh = useRef<THREE.Mesh>(null);
  const gapLight = useRef<THREE.PointLight>(null);
  const hairlineRef = useRef<THREE.Mesh>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const rimLight = useRef<THREE.PointLight>(null);
  const kickerLight = useRef<THREE.PointLight>(null);
  const corridorLight = useRef<THREE.PointLight>(null);

  const pointerCur = useRef({ x: 0, y: 0 });
  const readySent = useRef(false);
  const camInit = useRef(false);
  const camTarget = useRef({
    pos: new THREE.Vector3(),
    look: new THREE.Vector3(),
  });
  const camSmooth = useRef({ look: new THREE.Vector3() });

  useEffect(() => {
    hazePool.uniforms.uColor.value.set("#4d5b85");
  }, [hazePool]);

  /* R3F does not dispose resources created imperatively via useMemo —
     release them ourselves when the scene unmounts. */
  useEffect(() => {
    return () => {
      for (const r of [
        glass,
        metal,
        glow,
        hazePool,
        internalsMaterial,
        lineMaterial,
        corridorMaterial,
        hairlineMaterial,
        internalsGeometry,
        corridorGeometry,
        floorMaterial,
        practicalMaterial,
        pulseMaterial,
      ]) {
        r.dispose();
      }
    };
  }, [
    glass,
    metal,
    glow,
    hazePool,
    internalsMaterial,
    lineMaterial,
    corridorMaterial,
    hairlineMaterial,
    internalsGeometry,
    corridorGeometry,
    floorMaterial,
    practicalMaterial,
    pulseMaterial,
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

    /* -- the reveal: studio lights come up in sequence ---------------- */
    const lightRise = span(f, BEATS.lightsUp[0], BEATS.lightsUp[1]);
    const keyRise = easeInOutCubic(span(f, 0.18, 0.42));
    if (keyLight.current) {
      keyLight.current.intensity = keyRise * 2.3;
    }
    // rims are on from frame one: the landing image is the traced object
    const rimBreathe = 1 + Math.sin(t * 0.4) * 0.05;
    if (rimLight.current) {
      rimLight.current.intensity = 3.4 * rimBreathe;
    }
    if (kickerLight.current) {
      kickerLight.current.intensity = 2.0 * (2 - rimBreathe);
    }
    // the object is quietly lit from within even at landing — a lit
    // showroom piece — and the reveal brings it to full presence
    practicalMaterial.uniforms.uIntensity.value =
      (0.42 + easeInOutCubic(span(f, 0.22, 0.46)) * 0.75) *
      (1 - span(f, 0.86, 0.93));
    hazePool.uniforms.uOpacity.value =
      (0.16 + lightRise * 0.06) * (1 - span(f, 0.86, 0.94));
    floorMaterial.opacity = 0.2 + lightRise * 0.25;

    /* -- signal: the machined gap carries the brand light ------------- */
    const idlePulse = Math.sin(t * 1.6) * 0.5 + 0.5;
    const lineFade = 1 - span(f, 0.85, 0.9);
    lineMaterial.opacity = (0.72 + 0.18 * idlePulse) * lineFade;
    if (glowMesh.current) {
      glow.uniforms.uOpacity.value = (0.3 + 0.1 * idlePulse) * lineFade;
    }
    if (gapLight.current) {
      const flare = Math.sin(span(f, 0.84, 0.94) * Math.PI) * 2.2;
      const powerOn =
        Math.sin(span(f, BEATS.powerOn[0], BEATS.powerOn[1]) * Math.PI) * 1.5;
      gapLight.current.intensity = 0.6 + flare + powerOn;
    }

    /* -- the machine powers on: one pulse travels up the gap ---------- */
    const pulse01 = span(f, BEATS.powerOn[0], BEATS.powerOn[1]);
    if (pulseMesh.current) {
      pulseMesh.current.position.y = lerp(-1.3, 1.42, pulse01);
      pulseMesh.current.visible = pulse01 > 0 && pulse01 < 1;
      pulseMaterial.opacity = Math.sin(pulse01 * Math.PI);
    }

    /* -- camera: filmed, not programmed ------------------------------- */
    // Framing beats: a slow push through the reveal, a held creep during
    // the statement, then the commit and the pass.
    const camZ =
      f < 0.4
        ? track(f, 0, 0.4, 11.6, 10.6) * distMul
        : f < BEATS.approach[0]
          ? track(f, 0.4, BEATS.approach[0], 10.6, 10.0) * distMul
          : f < BEATS.passThrough[0]
            ? track(f, BEATS.approach[0], BEATS.passThrough[0], 10.0, 2.7) *
              distMul
            : track(
                f,
                BEATS.passThrough[0],
                1,
                2.7 * distMul,
                -7.5,
                easeInQuad
              );

    // dolly-zoom only for the pass — the lens widens as we cross the gap
    if (camera instanceof THREE.PerspectiveCamera) {
      const fov = baseFov + (passFov - baseFov) * span(f, 0.85, 0.98);
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }

    // gentle drift that dies before the approach; low angle rises to level
    const orbit = Math.sin(f * Math.PI * 0.9) * 0.35 * (1 - span(f, 0.6, 0.7));
    const camY = lerp(-0.18, 0, easeInOutCubic(span(f, 0.1, 0.5)));

    // editorial pan while the statements hold — type left, object right
    const editorialPan =
      -0.62 *
      fadeWindow(f, [0.3, 0.4, 0.72, 0.82]) *
      (tier === "mobile" ? 0.4 : 1);
    const frameX =
      K3D.visualCenterX * kScale * (1 - span(f, 0.72, 0.86)) + editorialPan;

    const breatheZ = Math.sin(t * 0.5) * 0.018;
    const microX = Math.sin(t * 0.31) * 0.006 + Math.sin(t * 0.77) * 0.003;
    const microY = Math.sin(t * 0.43) * 0.005;
    const targetPos = camTarget.current.pos.set(
      frameX + orbit * 0.8 + microX,
      camY + orbit * 0.18 + microY,
      camZ + breatheZ * (1 - span(f, 0.82, 1))
    );

    const parallax = 0.4 * (1 - span(f, 0.82, 0.92));
    const targetZ = -track(f, 0.82, 0.92, 0, 30);
    const targetLook = camTarget.current.look.set(
      frameX + p.x * parallax,
      p.y * parallax * 0.6,
      targetZ
    );

    if (!camInit.current) {
      camInit.current = true;
      camera.position.copy(targetPos);
      camSmooth.current.look.copy(targetLook);
    } else {
      camera.position.lerp(targetPos, 0.14);
      camSmooth.current.look.lerp(targetLook, 0.16);
    }
    camera.lookAt(camSmooth.current.look);

    /* -- the lit machine: barely-alive idle --------------------------- */
    if (kGroup.current) {
      kGroup.current.rotation.y = Math.sin(t * 0.22) * 0.015;
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

      {/* soft indirect bounce — the floor and walls return a little light */}
      <hemisphereLight args={["#1b2130", "#0a0c12", 0.3]} />
      <ambientLight intensity={0.04} />
      <directionalLight
        ref={keyLight}
        position={[3.5, 4, 2.5]}
        intensity={0}
        color="#e8eeff"
      />
      <pointLight
        ref={gapLight}
        position={[0, 0, 0.5]}
        color={ACCENT}
        intensity={0.6}
        distance={7}
        decay={2}
      />
      {/* the landing image: two rims trace the object out of the dark */}
      <pointLight
        ref={rimLight}
        position={[-2.6, 1.8, -2.8]}
        color="#aebcdf"
        intensity={3.4}
        distance={12}
        decay={2}
      />
      <pointLight
        ref={kickerLight}
        position={[3.2, -0.6, -2.4]}
        color="#8d9dc4"
        intensity={2.0}
        distance={11}
        decay={2}
      />

      {/* Automotive-studio environment: tall strip softboxes that draw long
          elegant reflections down the glass, one strong key box, dim fill. */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={3.4}
          position={[4.5, 3.5, 2.5]}
          scale={[3.4, 2.6, 1]}
          color="#e8edf8"
        />
        <Lightformer
          intensity={2.6}
          position={[-3.2, 0.6, 3.4]}
          rotation-y={0.5}
          scale={[0.55, 7, 1]}
          color="#cfd8ea"
        />
        <Lightformer
          intensity={2.2}
          position={[3.4, 0.4, 4.2]}
          rotation-y={-0.45}
          scale={[0.4, 7, 1]}
          color="#dbe3f2"
        />
        <Lightformer
          intensity={1.6}
          position={[0.5, 4.6, 0.5]}
          rotation-x={Math.PI / 2}
          scale={[6, 0.7, 1]}
          color="#c2cce2"
        />
        <Lightformer
          intensity={2.2}
          position={[-4, 1.5, -3]}
          rotation-y={Math.PI}
          scale={[2.5, 5, 1]}
          color="#9db0d6"
        />
        <Lightformer
          intensity={0.5}
          position={[0, 0.5, 7]}
          scale={[11, 8, 1]}
          color="#3a4668"
        />
      </Environment>

      {/* separation pool behind the K — silhouette never sinks into void */}
      <mesh position={[0.3, 0.1, -1.05]} scale={[13, 8.5, 1]}>
        <planeGeometry args={[1, 1]} />
        <primitive object={hazePool} attach="material" />
      </mesh>

      {/* studio practicals: one soft strip behind each limb, aligned to the
          limb's axis so the glass owns the light — nothing pokes out */}
      {[
        { x: -0.45, y: 0.15, rot: 0, h: 2.95, w: 0.62 },
        {
          x: K3D.arm.upperCenter[0],
          y: K3D.arm.upperCenter[1],
          rot: -K3D.armAngle,
          h: 1.9,
          w: 0.48,
        },
        {
          x: K3D.arm.lowerCenter[0],
          y: K3D.arm.lowerCenter[1],
          rot: K3D.armAngle,
          h: 1.9,
          w: 0.48,
        },
      ].map((s) => (
        <mesh
          key={`${s.x}-${s.y}`}
          position={[s.x, s.y, -1.25]}
          rotation={[0, 0, s.rot]}
        >
          <planeGeometry args={[s.w, s.h]} />
          <primitive object={practicalMaterial} attach="material" />
        </mesh>
      ))}

      {/* ---- The K — assembled, machined, on stage ---- */}
      <group ref={kGroup}>
        {/* the signal: the machined gap carries the brand light */}
        <mesh ref={lineMesh} scale={[1, K3D.signal.height / 0.02, 1]}>
          <boxGeometry args={[0.014, 0.02, 0.014]} />
          <primitive object={lineMaterial} attach="material" />
        </mesh>
        <mesh ref={glowMesh} scale={[1, 2.2, 1]}>
          <planeGeometry args={[1, 1]} />
          <primitive object={glow} attach="material" />
        </mesh>
        <mesh
          position={[0, K3D.signal.height / 2 + 0.03, 0]}
          material={metal}
        >
          <boxGeometry args={[0.06, 0.025, 0.06]} />
        </mesh>
        <mesh
          position={[0, -(K3D.signal.height / 2 + 0.03), 0]}
          material={metal}
        >
          <boxGeometry args={[0.06, 0.025, 0.06]} />
        </mesh>

        {/* power-on: one pulse of light travels up the gap */}
        <mesh ref={pulseMesh} visible={false}>
          <boxGeometry args={[0.028, 0.22, 0.028]} />
          <primitive object={pulseMaterial} attach="material" />
        </mesh>

        {/* stem */}
        <RoundedBox
          args={K3D.stem.size}
          radius={0.028}
          smoothness={4}
          position={K3D.stem.center}
          material={glass}
        />
        <mesh position={[K3D.railX, 0, 0.22]} material={metal}>
          <boxGeometry args={[0.025, K3D.bodyHeight, 0.025]} />
        </mesh>
        <mesh position={[K3D.railX, 0, -0.22]} material={metal}>
          <boxGeometry args={[0.025, K3D.bodyHeight, 0.025]} />
        </mesh>
        <mesh
          position={[K3D.stem.center[0], K3D.bodyHeight / 2 + 0.05, 0]}
          material={metal}
        >
          <boxGeometry args={[K3D.stem.size[0] + 0.06, 0.09, 0.56]} />
        </mesh>
        <mesh
          position={[K3D.stem.center[0], -(K3D.bodyHeight / 2 + 0.05), 0]}
          material={metal}
        >
          <boxGeometry args={[K3D.stem.size[0] + 0.06, 0.09, 0.56]} />
        </mesh>
        <BarCore
          size={K3D.stem.size}
          center={K3D.stem.center}
          material={internalsMaterial}
          ribGeometry={internalsGeometry}
        />

        {/* arms */}
        <RoundedBox
          args={K3D.arm.size}
          radius={0.028}
          smoothness={4}
          position={K3D.arm.upperCenter}
          rotation={[0, 0, -K3D.armAngle]}
          material={glass}
        />
        <mesh
          position={K3D.arm.upperTip}
          rotation={[0, 0, -K3D.armAngle]}
          material={metal}
        >
          <boxGeometry args={[K3D.arm.size[0] + 0.05, 0.08, 0.54]} />
        </mesh>
        <BarCore
          size={K3D.arm.size}
          rotation={-K3D.armAngle}
          center={K3D.arm.upperCenter}
          material={internalsMaterial}
          ribGeometry={internalsGeometry}
        />
        <RoundedBox
          args={K3D.arm.size}
          radius={0.028}
          smoothness={4}
          position={K3D.arm.lowerCenter}
          rotation={[0, 0, K3D.armAngle]}
          material={glass}
        />
        <mesh
          position={K3D.arm.lowerTip}
          rotation={[0, 0, K3D.armAngle]}
          material={metal}
        >
          <boxGeometry args={[K3D.arm.size[0] + 0.05, 0.08, 0.54]} />
        </mesh>
        <BarCore
          size={K3D.arm.size}
          rotation={K3D.armAngle}
          center={K3D.arm.lowerCenter}
          material={internalsMaterial}
          ribGeometry={internalsGeometry}
        />
      </group>

      {/* ---- floor: glossy dark ground with a real soft reflection ---- */}
      {tier === "high" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.78, -14]}>
          <planeGeometry args={[80, 110]} />
          <MeshReflectorMaterial
            blur={[420, 120]}
            resolution={512}
            mixBlur={0.9}
            mixStrength={2.4}
            roughness={0.82}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#040507"
            metalness={0.45}
            mirror={0.55}
          />
        </mesh>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.78, -20]}>
          <planeGeometry args={[120, 160]} />
          <primitive object={floorMaterial} attach="material" />
        </mesh>
      )}

      {/* ---- Chapter 03 teaser: sameness, receding into fog ---- */}
      <instancedMesh
        ref={corridorRef}
        args={[corridorGeometry, corridorMaterial, 24]}
      />
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
