// ForestScene.jsx
import React, { useState } from "react";
import { Physics, CuboidCollider } from "@react-three/rapier";

import Forest from "./components/Forest/Forest";
import ForestColliders from "./components/Forest/ForestCollider";
import Player from "./Player";
import FireflyCatch from "./components/FireflyCatch";
import BiosCluster from "./components/Bio/BiosCluster";
import { Environment, ContactShadows } from "@react-three/drei";
import { Perf } from "r3f-perf";

export default function ForestScene() {
  const [firefliesCleared, setFirefliesCleared] = useState(false);
  // One array to rule them all — edit these numbers to move boxes around.
  const colliders = [
    // Ground (center at y such that its TOP is where you want the floor)
    // If height = 1 and you want top at y=0 -> center should be y = -0.5
    { name: "ground", size: [50, 1, 50], position: [0, -0.2, 0] },

    // Walls (full sizes). Center Y is half height if they should sit on ground (top at y=0)
    { name: "wall-north", size: [50, 5, 2], position: [0, 2, 25] },
    { name: "wall-south", size: [60, 5, 2], position: [0, 2, -25] },
    { name: "wall-east", size: [2, 5, 60], position: [25, 2, 0] },
    { name: "wall-west", size: [2, 5, 60], position: [-25, 2, 0] },

    // Example obstacle you can drag around:
    // { name: "box-1", size: [6, 2, 6], position: [10, 1, -8] },
  ];

  return (
    <>
      {/* Lighting */}
      {/* HDRI night but brighter */}
      <Perf position="top-left" />
      <Environment preset="night" background blur={0.25} intensity={0.8} />

      {/* Moon key light (cool) */}
      <directionalLight
        position={[-6, 12, -4]}
        intensity={1.8}
        color="#a8c7ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* Soft warm fill so shadows aren’t black */}
      <hemisphereLight
        skyColor="#88aaff"
        groundColor="#223344"
        intensity={0.35}
      />

      {/* Optional subtle rim/fill */}
      <directionalLight position={[6, 4, 6]} intensity={0.5} color="#ffd7a8" />
      <ContactShadows
        position={[0, -0.01, 0]}
        scale={80}
        far={20}
        blur={2.2}
        opacity={0.35}
        resolution={256}
        frames={1}
      />

      {/* Forest model */}

      {/* Physics + player */}
      <Physics gravity={[0, -9.81, 0]}>
        <Player position={[0, 1.6, 0]} />
        <Forest
          position={[0, 0, 0]}
          envMapIntensity={1.0}
          hideSkydomes
          stripLights
          stripFog
          debug // turn on to verify, then off
          forceHide={["Object_8"]} // ← explicit hit
          hideLargestMeshes={1} // ← belt-and-braces: hide the biggest remaining shell
          largestMinRadius={50}
        />
        <ForestColliders items={colliders} showDebug={false} />
      </Physics>

      {/* ⬇️ Gate the bios behind the fireflies mini-game */}
      {!firefliesCleared && (
        <FireflyCatch
          count={8}
          areaRadius={10}
          onComplete={() => setFirefliesCleared(true)}
        />
      )}

      {firefliesCleared && <BiosCluster />}
    </>
  );
}
