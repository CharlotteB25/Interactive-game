import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useSimonStore } from "../../stores/simonStore";

// 4 colors / indices
const COLORS = [
  { key: "green", hex: "#22c55e" },
  { key: "red", hex: "#ef4444" },
  { key: "yellow", hex: "#eab308" },
  { key: "blue", hex: "#3b82f6" },
];

export default function SimonBeacons({
  positions = [
    [-1.5, 2, 14],
    [0.1, 2, 14],
    [1.5, 2, 14],
    [2.8, 2, 14],
  ],
  proximity = 1,
  onComplete,
}) {
  const matRefs = useRef([null, null, null, null]);
  const lightRefs = useRef([null, null, null, null]);

  const activeIdx = useSimonStore((s) => s.activeIdx);
  const revealing = useSimonStore((s) => s.revealing);
  const sequence = useSimonStore((s) => s.sequence);
  const setActiveIdx = useSimonStore((s) => s.setActiveIdx);
  const endReveal = useSimonStore((s) => s.endReveal);
  const setNearIndex = useSimonStore((s) => s.setNearIndex);
  const complete = useSimonStore((s) => s.complete);
  const stage = useSimonStore((s) => s.stage);

  // Reveal sequence pulses when (revealing) flips true
  useEffect(() => {
    if (!revealing || sequence.length === 0) return;

    // tweakable timings
    const preDelayMs = 1200; // delay before each reveal (incl. first)
    const paceMs = 700; // time between flashes
    const flashMs = 450; // how long a pad stays lit

    let i = -1;
    let int;
    const tick = () => {
      i++;
      if (i >= sequence.length) {
        setActiveIdx(-1);
        endReveal(); // hand control back to input
        return;
      }
      setActiveIdx(sequence[i]);
      // turn off after flashMs
      setTimeout(() => setActiveIdx(-1), flashMs);
    };

    const pre = setTimeout(() => {
      tick();
      int = setInterval(tick, paceMs);
    }, preDelayMs);

    return () => {
      clearTimeout(pre);
      if (int) clearInterval(int);
    };
  }, [revealing, sequence, setActiveIdx, endReveal]);

  // Animate brightness + compute proximity
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();

    // emissive / point lights
    matRefs.current.forEach((mat, i) => {
      if (!mat) return;
      const isActive = i === activeIdx;
      const idle = 0.9 + Math.max(0, Math.sin(t * 2) * 0.12);
      const burst = 3.6 + Math.max(0, Math.sin(t * 6) * 1.1);
      mat.emissiveIntensity = isActive ? burst : idle;
    });
    lightRefs.current.forEach((light, i) => {
      if (!light) return;
      const isActive = i === activeIdx;
      light.intensity = isActive
        ? 5.0 + Math.max(0, Math.sin(t * 6) * 0.8)
        : 0.0;
    });

    // horizontal-only proximity
    let idx = -1,
      best = Infinity;
    for (let i = 0; i < positions.length; i++) {
      const [x, , z] = positions[i];
      const dx = camera.position.x - x;
      const dz = camera.position.z - z;
      const d = Math.hypot(dx, dz);
      if (d < best && d <= proximity) {
        best = d;
        idx = i;
      }
    }
    setNearIndex(idx);
  });

  useEffect(() => {
    if (complete && onComplete) onComplete();
  }, [complete, onComplete]);

  return (
    <group>
      {positions.map(([x, y, z], i) => {
        const c = COLORS[i % COLORS.length].hex;
        return (
          <group key={i} position={[x, y, z]}>
            <Float floatIntensity={1.2} rotationIntensity={0.1}>
              <mesh>
                <icosahedronGeometry args={[0.18, 0]} />
                <meshStandardMaterial
                  ref={(r) => (matRefs.current[i] = r)}
                  color={c}
                  emissive={c}
                  emissiveIntensity={1.2}
                  roughness={0.2}
                  metalness={0.1}
                  toneMapped={false}
                />
              </mesh>

              {/* additive glow shell */}
              <mesh scale={1.2}>
                <icosahedronGeometry args={[0.22, 0]} />
                <meshBasicMaterial
                  color={c}
                  transparent
                  opacity={i === activeIdx ? 0.45 : 0.08}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>

              {/* point light */}
              <pointLight
                ref={(r) => (lightRefs.current[i] = r)}
                color={c}
                intensity={0}
                distance={4.5}
                decay={2}
                castShadow={false}
              />
            </Float>
          </group>
        );
      })}
    </group>
  );
}
