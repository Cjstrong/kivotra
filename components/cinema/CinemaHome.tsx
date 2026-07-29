"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { hasWebGL } from "@/lib/cinema";
import Fallback from "./Fallback";

// The WebGL experience is heavy — load it only when we've decided to use it.
const Cinema = dynamic(() => import("./Cinema"), { ssr: false });

/**
 * Decides between the full cinematic experience and the static fallback.
 * Server renders the fallback (real content for SEO / no-JS). On the client we
 * upgrade to the cinema when WebGL is available and motion is allowed.
 */
export default function CinemaHome() {
  const [mode, setMode] = useState<"fallback" | "cinema">("fallback");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && hasWebGL()) setMode("cinema");
  }, []);

  return mode === "cinema" ? <Cinema /> : <Fallback />;
}
