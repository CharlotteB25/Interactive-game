// src/components/FloatBio.jsx
import React, { useRef, useState } from "react";
import { Html, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function FloatBio({
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
