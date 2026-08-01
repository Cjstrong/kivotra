"use client";

import dynamic from "next/dynamic";

const Film = dynamic(() => import("./Film"), { ssr: false });

export default function FilmLoader() {
  return <Film />;
}
