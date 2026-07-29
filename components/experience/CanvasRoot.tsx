"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import KScene from "./scene/KScene";
import { deviceTier, DPR_CAP } from "@/lib/experience/quality";
import styles from "./CanvasRoot.module.css";

/** The one persistent WebGL canvas. Everything 3D lives inside KScene. */
export default function CanvasRoot({ onReady }: { onReady: () => void }) {
  const tier = useMemo(() => deviceTier(), []);

  return (
    <div className={styles.wrap} aria-hidden="true">
      <Canvas
        dpr={[1, DPR_CAP[tier]]}
        camera={{
          fov: tier === "mobile" ? 50 : 42,
          // near must clear the K's half-gap (~0.077 wu) during pass-through
          near: 0.04,
          far: 80,
          position: [0, 0, 12],
        }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <KScene tier={tier} onReady={onReady} />
      </Canvas>
    </div>
  );
}
