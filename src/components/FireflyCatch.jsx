// components/FireflyCatch.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

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

export default function FireflyCatch({
  count = 8,
  areaRadius = 10,
  minY = 1.2,
  maxY = 4.6,
  catchDistance = 4.0, // auto-catch when you walk through one
  maxVisibleDistance = 60,
  onComplete,
}) {
  const { camera } = useThree();

  // ----- visual particles -----
  const glowTex = useGlowTexture();
  const spriteRefs = useRef([]);
  const acc = useRef(0);

  if (spriteRefs.current.length !== count) {
    spriteRefs.current = Array.from({ length: count }, () => null);
  }

  const bases = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        baseX: (Math.random() - 0.5) * areaRadius * 2,
        baseZ: (Math.random() - 0.5) * areaRadius * 2,
        baseY: minY + Math.random() * (maxY - minY),
        sp: 1.2 + Math.random(),
        phase: Math.random() * 10,
        orbitR: 0.8 + Math.random() * 1.5,
        orbitS: 0.25 + Math.random() * 0.6,
        orbitAngle: Math.random() * Math.PI * 2,
        wobbleAngle: Math.random() * Math.PI * 2,
      })),
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

  // ----- gameplay state -----
  const [caught, setCaught] = useState(() => Array(count).fill(false));
  const caughtCount = caught.filter(Boolean).length;

  // local stage & overlays live here (intro -> playing -> complete)
  const [stage, setStage] = useState("intro");

  // ensure sprites always render even if behind trees
  useEffect(() => {
    spriteRefs.current.forEach((s) => s && (s.frustumCulled = false));
  }, []);

  // motion + auto-catch
  useFrame((_, delta) => {
    acc.current += delta;
    if (acc.current < 1 / 30) return;
    const step = acc.current;
    acc.current = 0;

    const cam = camera.position;
    const catchD2 = catchDistance * catchDistance;
    const visD2 = maxVisibleDistance * maxVisibleDistance;

    for (let i = 0; i < count; i++) {
      const spr = spriteRefs.current[i];
      if (!spr) continue;

      if (caught[i]) {
        spr.visible = false;
        continue;
      }

      const b = bases[i];
      b.orbitAngle += step * b.orbitS;
      b.wobbleAngle += step * b.sp;

      const cx = b.baseX + Math.cos(b.orbitAngle + b.phase) * b.orbitR;
      const cz = b.baseZ + Math.sin(b.orbitAngle + b.phase) * b.orbitR;

      const x = cx + Math.sin(b.wobbleAngle) * 1.0;
      const z = cz + Math.cos(b.wobbleAngle * 0.95 + b.phase * 1.3) * 1.0;
      const y = THREE.MathUtils.clamp(
        b.baseY + Math.sin(b.wobbleAngle * 1.4) * 0.35,
        minY,
        maxY
      );

      spr.position.set(x, y, z);

      // visibility
      const dx = cam.x - x,
        dy = cam.y - y,
        dz = cam.z - z;
      const d2 = dx * dx + dy * dy + dz * dz;
      spr.visible = d2 < visD2;

      // auto-catch while playing
      if (stage === "playing" && d2 <= catchD2) {
        setCaught((prev) => {
          if (prev[i]) return prev;
          const next = prev.slice();
          next[i] = true;
          return next;
        });
      }

      // little breathing scale
      const s = 0.45 + Math.sin(b.wobbleAngle * 2.2) * 0.12;
      spr.scale.setScalar(s);
    }
  });

  // completion
  useEffect(() => {
    if (stage === "playing" && caughtCount === count) {
      setStage("complete");
      onComplete?.();
    }
  }, [caughtCount, count, stage, onComplete]);

  // ====== RENDER ======
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <sprite
          key={i}
          ref={(r) => (spriteRefs.current[i] = r)}
          scale={[0.6, 0.6, 0.6]}
        >
          <spriteMaterial
            map={glowTex}
            color={colors[i]}
            transparent
            opacity={0.9}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}

      {/* INTRO overlay (same style as your previous cards) */}
      {stage === "intro" && (
        <Html
          fullscreen
          zIndexRange={[1000, 2000]}
          style={{ pointerEvents: "auto" }}
        >
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,0,0,0.7)",
            }}
          >
            <div
              style={{
                width: "min(92vw, 520px)",
                background: "rgba(0,0,0,0.85)",
                color: "#e2e8f0",
                borderRadius: 10,
                padding: "28px 32px",
                textAlign: "center",
                fontFamily: `"Courier New", monospace`,
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(148,163,184,0.2)",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 22,
                  marginBottom: 12,
                  color: "#10b981",
                  letterSpacing: 1,
                }}
              >
                FIREFLY CATCH
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 18,
                    background: "#10b981",
                    marginLeft: 8,
                    verticalAlign: "-2px",
                    animation: "blink 1.2s steps(1,end) infinite",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 15,
                  opacity: 0.85,
                  marginBottom: 20,
                  lineHeight: 1.4,
                }}
              >
                Chase the glowing fireflies and walk through them to collect.
                <br />
                Collect all <b>{count}</b> to proceed.
              </div>
              <button
                onClick={() => setStage("playing")}
                style={{
                  padding: "12px 18px",
                  borderRadius: 6,
                  border: "1px solid #10b981",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontFamily: `"Courier New", monospace`,
                  color: "#10b981",
                  background: "transparent",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "rgba(16,185,129,0.1)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                START
              </button>

              <style>
                {`
                  @keyframes blink {
                    0%, 49% { opacity: 1; }
                    50%, 100% { opacity: 0; }
                  }
                `}
              </style>
            </div>
          </div>
        </Html>
      )}

      {/* HUD while playing (top-right, same style) */}
      {stage === "playing" && (
        <Html
          fullscreen
          zIndexRange={[900, 2000]}
          style={{ pointerEvents: "auto" }}
        >
          <div
            style={{
              position: "fixed",
              top: 12,
              right: 12,
            }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.85)",
                color: "#f1f5f9",
                padding: "12px 14px",
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.4,
                minWidth: 220,
                fontFamily: `"Courier New", monospace`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(148,163,184,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 700, color: "#10b981" }}>
                  FIREFLY CATCH
                </div>
                <div style={{ opacity: 0.85 }}>
                  Fireflies: {caughtCount} / {count}
                </div>
              </div>
              <div style={{ opacity: 0.9 }}>
                Walk through a firefly to collect it.
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
