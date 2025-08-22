// src/components/Bios/BiosCluster.jsx
import React from "react";
import FloatBio from "./FloatBio";

/**
 * Renders a group of FloatBio items. You can:
 * - pass your own `bios` array to override defaults
 * - or just use the defaults below
 */
export default function BiosCluster({
  bios = [
    {
      position: [0, 1.8, -2],
      title: "Hi, I'm Alex 👋",
      text:
        "Creative developer focused on immersive web (WebGL / R3F). " +
        "I love building playful interfaces with real-time graphics.",
    },
    {
      position: [3, 1.8, 1],
      title: "Tech Stack",
      text:
        "React, TypeScript, R3F/three.js, GLSL, Zustand, Vite. " +
        "Node/Express and Python for tooling.",
    },
    {
      position: [-3, 1.8, 2.5],
      title: "Recent Work",
      text:
        "XR puzzle room for a launch; optimized shader pipeline and " +
        "cut GPU frame time by 38%.",
    },
  ],
}) {
  return (
    <>
      {bios.map((b, i) => (
        <FloatBio key={i} position={b.position} title={b.title} text={b.text} />
      ))}
    </>
  );
}
