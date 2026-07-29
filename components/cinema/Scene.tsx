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

    cur.current.x += (0.25 + px - cur.current.x) * lam;
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
      <color attach="background" args={["#050607"]} />
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
      <CameraRig />
      <AdvanceBridge />

      <KModel />

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
          <Bloom intensity={0.22} luminanceThreshold={0.9} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.24} darkness={0.78} />
        </EffectComposer>
      )}
    </>
  );
}
