// ForestScene.jsx
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Float } from "@react-three/drei"; // removed OrbitControls to avoid conflicts
import { Physics, CuboidCollider } from "@react-three/rapier";

import Forest from "./components/Forest/Forest";
import Player from "./Player";
import FireflyCatch from "./components/FireflyCatch"; // <-- make sure this path matches your file

function FloatBio({
  position = [0, 1.6, 0],
  title = "Title",
  text = "…",
  threshold = 2.6,
}) {
  const ref = useRef();
  const [near, setNear] = useState(false);

  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 1.2) * 0.25;
      ref.current.rotation.y = Math.sin(t * 0.4) * 0.2;
    }
    const dx = camera.position.x - position[0];
    const dy = camera.position.y - position[1];
    const dz = camera.position.z - position[2];
    setNear(Math.hypot(dx, dy, dz) < threshold);
  });

  return (
    <group position={position}>
      <Float floatIntensity={1.4}>
        <mesh ref={ref} castShadow>
          <icosahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color="#a78bfa"
            metalness={0.2}
            roughness={0.3}
            emissive="#7c3aed"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>

      {near && (
        <Html center>
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              padding: 12,
              borderRadius: 12,
              width: 260,
              color: "#111",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontWeight: 700 }}>{title}</div>
            <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.3 }}>
              {text}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function ForestScene() {
  const [firefliesDone, setFirefliesDone] = useState(false);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 4]} intensity={1.2} castShadow />

      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Forest model */}
      <Forest position={[0, 1, 0]} />

      {/* Physics world + player + ground collider */}
      <Physics gravity={[0, -9.81, 0]}>
        <Player position={[0, 1.6, 0]} />
        <CuboidCollider args={[60, 0.5, 60]} position={[0, -0.5, 0]} />
      </Physics>

      {/* Mini-game first */}
      {!firefliesDone && (
        <FireflyCatch
          count={8}
          areaRadius={6}
          onComplete={() => setFirefliesDone(true)}
        />
      )}

      {/* Show bios AFTER mini-game */}
      {firefliesDone && (
        <>
          <FloatBio
            position={[0, 1.8, -2]}
            title="Hi, I'm Alex 👋"
            text="Creative developer focused on immersive web (WebGL / R3F). I love building playful interfaces with real-time graphics."
          />
          <FloatBio
            position={[3, 1.8, 1]}
            title="Tech Stack"
            text="React, TypeScript, R3F/three.js, GLSL, Zustand, Vite. Node/Express and Python for tooling."
          />
          <FloatBio
            position={[-3, 1.8, 2.5]}
            title="Recent Work"
            text="XR puzzle room for a launch; optimized shader pipeline and cut GPU frame time by 38%."
          />
        </>
      )}

      {/* If you want OrbitControls here, avoid using PointerLock at the same time */}
      {/*
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={16}
      />
      */}
    </>
  );
}
