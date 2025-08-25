import React, { useRef, useState } from "react";
import { Html, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function FloatBio({
  position = [0, 1.6, 0],
  title = "Title",
  text = "…",
  threshold = 2.6,

  // NEW: model support
  Model = null, // e.g., Books / Computer / ...
  modelScale = 1,
  modelRotation = [0, 0, 0],
  modelOffset = [0, 0, 0], // nudge model inside the float
}) {
  const ref = useRef();
  const [near, setNear] = useState(false);

  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();

    // gentle float/rock on the inner group
    if (ref.current) {
      ref.current.position.y = modelOffset[1] + Math.sin(t * 1.2) * 0.25;
      ref.current.rotation.y = Math.sin(t * 0.4) * 0.2;
    }

    // proximity check (uses the position prop)
    const dx = camera.position.x - position[0];
    const dy = camera.position.y - position[1];
    const dz = camera.position.z - position[2];
    setNear(Math.hypot(dx, dy, dz) < threshold);
  });

  return (
    <group position={position}>
      <Float floatIntensity={1.4}>
        {/* Inner group that we animate */}
        <group ref={ref} position={[modelOffset[0], 0, modelOffset[2]]}>
          {Model ? (
            <group scale={modelScale} rotation={modelRotation} castShadow>
              <Model />
            </group>
          ) : (
            // Fallback to your old shape if no model is provided
            <mesh castShadow>
              <icosahedronGeometry args={[0.6, 0]} />
              <meshStandardMaterial
                color="#a78bfa"
                metalness={0.2}
                roughness={0.3}
                emissive="#7c3aed"
                emissiveIntensity={0.4}
              />
            </mesh>
          )}
        </group>
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
