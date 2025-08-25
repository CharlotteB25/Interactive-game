import React from "react";
import FloatBio from "./FloatBio";

// Import your model components
import Books from "../ForestModels/Books/Books";
import Computer from "../ForestModels/Computer/Computer";
import Guitar from "../ForestModels/Guitar/Guitar";
import Plane from "../ForestModels/Plane/Plane";

/**
 * Renders a group of FloatBio items
 */
export default function BiosCluster({
  bios = [
    {
      position: [0, 1.8, -2],
      title: "Hi, I'm Alex 👋",
      text:
        "Creative developer focused on immersive web (WebGL / R3F). " +
        "I love building playful interfaces with real-time graphics.",
      Model: Books, // <- use your model here
      modelScale: 0.9,
      modelRotation: [0, Math.PI * 0.15, 0],
      modelOffset: [0, 0, 0],
    },
    {
      position: [3, 1.8, 1],
      title: "Tech Stack",
      text:
        "React, TypeScript, R3F/three.js, GLSL, Zustand, Vite. " +
        "Node/Express and Python for tooling.",
      Model: Computer,
      modelScale: 0.8,
      modelRotation: [0, -Math.PI * 0.2, 0],
    },
    {
      position: [-3, 1.8, 2.5],
      title: "Recent Work",
      text:
        "XR puzzle room for a launch; optimized shader pipeline and " +
        "cut GPU frame time by 38%.",
      Model: Guitar,
      modelScale: 1.1,
      modelRotation: [0, Math.PI * 0.25, 0],
    },

    {
      position: [-3, 1.8, 2.5],
      title: "Recent Work",
      text:
        "XR puzzle room for a launch; optimized shader pipeline and " +
        "cut GPU frame time by 38%.",
      Model: Plane,
      modelScale: 1.1,
      modelRotation: [0, Math.PI * 0.25, 0],
    },
  ],
}) {
  return (
    <>
      {bios.map((b, i) => (
        <FloatBio
          key={i}
          position={b.position}
          title={b.title}
          text={b.text}
          Model={b.Model}
          modelScale={b.modelScale}
          modelRotation={b.modelRotation}
          modelOffset={b.modelOffset}
        />
      ))}
    </>
  );
}
