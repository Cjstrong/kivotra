"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { cinema } from "@/lib/cinema";
import Scene from "./Scene";

/**
 * The one Canvas. Mounted once behind the pinned stage, never remounted.
 * Adaptive DPR; render loop pauses when the tab is hidden.
 */
export default function CinemaCanvas() {
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    const onVis = () => {
      cinema.paused = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div className="cinema-canvas" aria-hidden="true">
      <Canvas
        gl={{
          antialias: cinema.tier !== "low",
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.02,
        }}
        dpr={dpr}
        camera={{ position: [0.25, -0.4, 9.4], fov: 40, near: 0.1, far: 60 }}
        frameloop="always"
        style={{ pointerEvents: "none" }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(0.85, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(2, d + 0.15))}
          flipflops={3}
        />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
