"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { cinema } from "@/lib/cinema";
import Scene from "./scene/Scene";

export default function FilmCanvas({ onReady }: { onReady: () => void }) {
  const maxDpr = cinema.tier === "high" ? 2 : 1.5;

  return (
    <Canvas
      dpr={[1, maxDpr]}
      camera={{ fov: 38, near: 0.1, far: 90, position: [0, 0.1, 9.2] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
      onCreated={({ gl, scene }) => {
        const pmrem = new THREE.PMREMGenerator(gl);
        const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = env.texture;
        scene.environmentIntensity = 0.14;
        pmrem.dispose();
        requestAnimationFrame(() => requestAnimationFrame(onReady));
      }}
    >
      <Scene />
    </Canvas>
  );
}
