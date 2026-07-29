"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { chan, cinema } from "@/lib/cinema";
import KModel from "./KModel";

const _target = new THREE.Vector3();
const _look = new THREE.Vector3();

/**
 * Studio: one dark room, one object, white softbox lighting. The camera
 * reads its dolly from the master timeline's channels; the pointer adds a
 * small, damped lean. Nothing else moves.
 */
function CameraRig() {
  const { camera } = useThree();
  const cur = useRef({ x: 0.25, y: chan.camY, z: chan.camZ, ty: chan.targetY });

  useFrame((_, delta) => {
    if (cinema.paused) return;
    const dt = Math.min(delta, 1 / 30);
    const lam = 1 - Math.exp(-5 * dt);

    const px = cinema.reduced ? 0 : cinema.pointerX * 0.5;
    const py = cinema.reduced ? 0 : cinema.pointerY * 0.3;

    cur.current.x += (chan.camX + px - cur.current.x) * lam;
    cur.current.y += (chan.camY + py - cur.current.y) * lam;
    cur.current.z += (chan.camZ - cur.current.z) * lam;
    cur.current.ty += (chan.targetY - cur.current.ty) * lam;

    camera.position.set(cur.current.x, cur.current.y, cur.current.z);
    _look.set(0.25 + px * 0.3, cur.current.ty, 0);
    camera.lookAt(_look);
    cinema.ready = true;
  });

  return null;
}

/**
 * The narrow travelling light — LIGHT BUILDS THE K. Sweeps once across
 * the sculpture during the intro (chan.sweep -1 → 1), brightest mid-pass,
 * then hands the scene to the studio rig. Cools away during the unfold.
 */
function SweepLight() {
  const light = useRef<THREE.SpotLight>(null);
  useFrame(() => {
    const l = light.current;
    if (!l || cinema.paused) return;
    const s = chan.sweep;
    l.position.set(s * 7, 2.4, 5.5);
    /* bell curve: full power mid-sweep, gone at either end */
    const bell = Math.max(0, 1 - s * s);
    l.intensity = 26 * bell * (1 - Math.min(1, chan.kUnfold));
    l.target.position.set(0.6, 0.4, 0);
    l.target.updateMatrixWorld();
  });
  return (
    <spotLight
      ref={light}
      position={[-7, 2.4, 5.5]}
      angle={0.32}
      penumbra={0.9}
      decay={1.6}
      intensity={0}
      color="#cfe2ff"
    />
  );
}

/** Key light follows the pointer so reflections slide across the glass. */
function KeyLight() {
  const light = useRef<THREE.DirectionalLight>(null);
  useFrame((_, delta) => {
    if (!light.current || cinema.paused) return;
    const dt = Math.min(delta, 1 / 30);
    _target.set(cinema.pointerX * 4, 3.6 + cinema.pointerY * 2, 7);
    light.current.position.lerp(_target, 1 - Math.exp(-4 * dt));
  });
  return (
    <directionalLight
      ref={light}
      position={[2.5, 3.6, 7]}
      intensity={1.7}
      color="#f4f8fa"
      castShadow={cinema.tier === "high"}
      shadow-mapSize={[1024, 1024]}
    />
  );
}

/**
 * Studio softboxes. On high tier the main box drifts very slowly, so
 * reflections travel across the crystal — the form is revealed by moving
 * light, not by outlines.
 */
function Studio() {
  const tier = cinema.tier;
  const main = useRef<THREE.Group>(null);

  return (
    <Environment resolution={tier === "high" ? 256 : 128} frames={1}>
      <color attach="background" args={["#070b12"]} />
      {/* deep blue backdrop — gives the transmission something to bend.
          Without this the glass refracts pure void and reads as grey. */}
      <Lightformer intensity={0.55} position={[0, 0.5, -7]} scale={[16, 10, 1]} color="#2a4a7d" />
      {/* large drifting softbox — the hero reflection */}
      <group ref={main}>
        <Lightformer
          intensity={2.6}
          position={[0, 4.5, 3.5]}
          rotation-x={-Math.PI / 2}
          scale={[8, 4, 1]}
          color="#ffffff"
        />
      </group>
      {/* thin vertical strips — the jewellery lights */}
      <Lightformer intensity={1.4} position={[-5.5, 0.5, 2.5]} rotation-y={Math.PI / 2} scale={[0.8, 9, 1]} color="#f2f7f8" />
      <Lightformer intensity={1.2} position={[5.5, 0.5, 2.5]} rotation-y={-Math.PI / 2} scale={[0.8, 9, 1]} color="#eef3f5" />
      {/* front fill — the camera-side softbox the front faces mirror */}
      <Lightformer intensity={1.5} position={[0, 1.2, 9]} rotation-y={Math.PI} scale={[11, 5, 1]} color="#e9f1f3" />
      {/* restrained top + faint floor bounce */}
      <Lightformer intensity={0.8} position={[0, 6, -1]} rotation-x={-Math.PI / 2} scale={[12, 3, 1]} color="#dfe8ea" />
      <Lightformer intensity={0.35} position={[0, -5, 2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} color="#bcd6d3" />
    </Environment>
  );
}

/**
 * Dust in the light — a sparse particle field around the sculpture.
 * Visible only while the K is at rest (the hero), fading as the film
 * moves on. Skipped entirely on low tier and for reduced motion.
 */
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const count = cinema.tier === "high" ? 140 : 70;

  const positions = useRef<Float32Array | null>(null);
  if (!positions.current) {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6 + 0.6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 0.5;
    }
    positions.current = arr;
  }

  useFrame((state) => {
    if (cinema.paused) return;
    const rest = (1 - Math.min(1, chan.kUnfold)) * (1 - Math.min(1, chan.kParked));
    if (mat.current) mat.current.opacity = 0.32 * rest;
    if (ref.current) {
      ref.current.visible = rest > 0.02;
      // the slowest possible drift — dust hanging in a light shaft
      ref.current.rotation.y = state.clock.elapsedTime * 0.008;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.08;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        size={0.035}
        color="#9fc4ff"
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/** Dev-only: manual frame stepping for verification when rAF is throttled. */
function AdvanceBridge() {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __cineAdvance?: (n?: number) => void }).__cineAdvance =
      (n = 40) => {
        let t = performance.now();
        for (let i = 0; i < n; i++) {
          t += 16;
          advance(t, true);
        }
      };
  }, [advance]);
  return null;
}

export default function Scene() {
  const tier = cinema.tier;

  return (
    <>
      <fog attach="fog" args={["#050608", 13, 28]} />
      <ambientLight intensity={0.24} />
      <hemisphereLight intensity={0.3} color="#e8f2f5" groundColor="#0c0f12" />
      <KeyLight />
      <SweepLight />
      {/* cool rim from behind — feeds the crystal's blue heart */}
      <directionalLight position={[-4, 2.2, -5]} intensity={0.65} color="#5b8ee6" />
      <CameraRig />
      <AdvanceBridge />

      <KModel />
      {tier !== "low" && !cinema.reduced && <Particles />}

      {/* grounded, luxury: a soft shadow beneath the object */}
      <ContactShadows
        position={[0, -2.05, 0]}
        opacity={0.42}
        scale={15}
        blur={2.6}
        far={4}
        resolution={tier === "high" ? 512 : 256}
        color="#000000"
        frames={Infinity}
      />

      <Studio />

      {tier !== "low" && (
        <EffectComposer enableNormalPass={false} multisampling={tier === "high" ? 4 : 0}>
          <Bloom intensity={0.34} luminanceThreshold={0.82} luminanceSmoothing={0.85} mipmapBlur />
          <Vignette eskil={false} offset={0.24} darkness={0.78} />
        </EffectComposer>
      )}
    </>
  );
}
