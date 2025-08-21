// components/FireflyCatch.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Html, Float } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Soft radial glow (no external textures)
function useGlowTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    g.addColorStop(0, "white");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);
}

/**
 * Firefly mini-game
 * - Walk near a firefly and press Space to catch it
 * - When all are caught, calls onComplete()
 */
export default function FireflyCatch({
  count = 8,
  areaRadius = 6, // spawn radius around the scene origin (x/z)
  minY = 1.2,
  maxY = 3.5,
  catchDistance = 1.4, // how close to be able to catch
  onComplete,
}) {
  const { camera } = useThree();

  const glowTex = useGlowTexture();
  const spriteRefs = useRef(Array.from({ length: count }, () => null));
  const lightRefs = useRef(Array.from({ length: count }, () => null));

  // base positions + animation seeds
  const bases = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const ang = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        const r = areaRadius * (0.55 + Math.random() * 0.45);
        const x = Math.cos(ang) * r;
        const z = Math.sin(ang) * r;
        const y = minY + Math.random() * (maxY - minY);
        return {
          x,
          y,
          z,
          sp: 0.6 + Math.random() * 0.6,
          phase: Math.random() * 10,
        };
      }),
    [count, areaRadius, minY, maxY]
  );

  const colors = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const c = new THREE.Color().setHSL(
          0.12 + Math.random() * 0.15,
          0.9,
          0.6
        );
        return `#${c.getHexString()}`;
      }),
    [count]
  );

  const [caught, setCaught] = useState(() => Array(count).fill(false));
  const caughtCount = caught.filter(Boolean).length;
  const [nearIndex, setNearIndex] = useState(-1);
  const [started, setStarted] = useState(false);

  // Key input: Space to catch nearest
  useEffect(() => {
    const onKey = (e) => {
      const isSpace =
        e.code === "Space" || e.key === " " || e.key === "Spacebar";
      if (!isSpace || !started) return;
      if (nearIndex !== -1 && !caught[nearIndex]) {
        setCaught((prev) => {
          const next = prev.slice();
          next[nearIndex] = true;
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nearIndex, caught, started]);

  // Animate + proximity check
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    let closest = -1;
    let bestDist = Infinity;

    for (let i = 0; i < count; i++) {
      const spr = spriteRefs.current[i];
      const light = lightRefs.current[i];
      if (!spr || !light) continue;

      // Animate wandering around base
      const b = bases[i];
      const wobX = Math.sin(t * b.sp + b.phase) * 0.6;
      const wobZ = Math.cos(t * (b.sp * 0.9) + b.phase * 1.3) * 0.6;
      const wobY = Math.sin(t * (b.sp * 1.6) + b.phase) * 0.25;

      const x = b.x + wobX;
      const y = THREE.MathUtils.clamp(b.y + wobY, minY, maxY);
      const z = b.z + wobZ;

      spr.position.set(x, y, z);
      light.position.set(x, y, z);

      // Pulse
      const pulse =
        0.55 +
        Math.max(
          0,
          Math.sin(t * (caught[i] ? 1.5 : 4.0)) * (caught[i] ? 0.15 : 0.35)
        );
      spr.scale.setScalar(caught[i] ? 0.25 + pulse * 0.15 : 0.45 + pulse * 0.2);
      light.intensity = caught[i]
        ? 0.0
        : 2.6 + Math.max(0, Math.sin(t * 6) * 0.9);

      // Proximity (only for uncaught)
      if (!caught[i]) {
        const dx = camera.position.x - x;
        const dy = camera.position.y - y;
        const dz = camera.position.z - z;
        const d = Math.hypot(dx, dy, dz);
        if (d < bestDist) {
          bestDist = d;
          closest = i;
        }
      }

      // Hide when caught (quick fade out)
      spr.visible = !caught[i];
      light.visible = !caught[i];
    }

    setNearIndex(bestDist <= catchDistance ? closest : -1);
  });

  // Completion
  useEffect(() => {
    if (caughtCount === count && started) {
      onComplete?.();
    }
  }, [caughtCount, count, started, onComplete]);

  return (
    <group>
      {/* Fireflies */}
      {Array.from({ length: count }).map((_, i) => (
        <Float key={i} floatIntensity={1.2} rotationIntensity={0.1}>
          {/* Glow sprite */}
          <sprite
            ref={(r) => (spriteRefs.current[i] = r)}
            scale={[0.6, 0.6, 0.6]}
          >
            <spriteMaterial
              map={glowTex}
              color={colors[i]}
              transparent
              opacity={0.9}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>

          {/* Little point light */}
          <pointLight
            ref={(r) => (lightRefs.current[i] = r)}
            color={colors[i]}
            intensity={0}
            distance={3.5}
            decay={2}
          />
        </Float>
      ))}

      {/* Intro overlay */}
      {!started && (
        <Html fullscreen>
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,0,0,0.6)",
              zIndex: 50,
            }}
          >
            <div
              style={{
                width: "min(92vw, 520px)",
                background: "white",
                color: "#111",
                borderRadius: 16,
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                padding: 24,
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                Catch the Fireflies
              </div>
              <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>
                Walk up to a firefly and press <b>Space</b> to catch it. Catch
                them all to continue.
              </div>
              <button
                onClick={() => setStarted(true)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: 0,
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "white",
                  background: "#16a34a",
                  minWidth: 140,
                }}
              >
                Start
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* Fixed HUD (like Perf/Leva) */}
      {started && (
        <Html fullscreen>
          <div
            style={{
              position: "fixed",
              top: 12,
              right: 12,
              zIndex: 40,
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                background: "rgba(17,17,17,0.85)",
                color: "white",
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 12,
                lineHeight: 1.35,
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                minWidth: 220,
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ fontWeight: 700 }}>Fireflies</div>
                <div style={{ opacity: 0.85 }}>
                  {caughtCount} / {count}
                </div>
              </div>
              <div style={{ marginTop: 6, opacity: 0.9 }}>
                {nearIndex !== -1
                  ? "Press Space to catch"
                  : "Find a nearby firefly"}
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
