"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { hasWebGL, prefersReducedMotion } from "@/lib/experience/quality";
import StaticEdition from "@/components/static/StaticEdition";

// The film is heavy — fetched only once we know the device can run it.
const Film = dynamic(() => import("./Film"), { ssr: false });

/**
 * Server renders the static edition (real content for SEO and no-JS).
 * On the client we upgrade to the film when WebGL is available and the
 * visitor allows motion.
 */
export default function Experience() {
  const [mode, setMode] = useState<"static" | "film">("static");

  useEffect(() => {
    if (!prefersReducedMotion() && hasWebGL()) setMode("film");
  }, []);

  return mode === "film" ? <Film /> : <StaticEdition />;
}
