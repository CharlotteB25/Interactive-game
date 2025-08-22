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
  catchDistance = 1.4,
  maxVisibleDistance = 60,
  onComplete,
}) {
  const { camera } = useThree();

  const glowTex = useGlowTexture();
  const spriteRefs = useRef([]);
  const acc = useRef(0);
  const nearIndexRef = useRef(-1);

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

  const [caught, setCaught] = useState(() => Array(count).fill(false));
  const caughtCount = caught.filter(Boolean).length;
  const [nearIndex, setNearIndex] = useState(-1);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    spriteRefs.current.forEach((s) => s && (s.frustumCulled = false));
  });

  useEffect(() => {
    const onKey = (e) => {
      const isSpace =
        e.code === "Space" || e.key === " " || e.key === "Spacebar";
      if (!isSpace || !started) return;
      const i = nearIndexRef.current;
      if (i !== -1 && !caught[i]) {
        setCaught((prev) => {
          const next = prev.slice();
          next[i] = true;
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [caught, started]);

  useFrame((_, delta) => {
    acc.current += delta;
    if (acc.current < 1 / 30) return; // ~30fps logic
    const step = acc.current;
    acc.current = 0;

    let closest = -1;
    let bestD2 = Infinity;

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

      const dx = cam.x - x,
        dy = cam.y - y,
        dz = cam.z - z;
      const d2 = dx * dx + dy * dy + dz * dz;

      const visible = d2 < visD2;
      spr.visible = visible;
      if (!visible) continue;

      if (d2 < bestD2) {
        bestD2 = d2;
        closest = i;
      }

      const s = 0.45 + Math.sin(b.wobbleAngle * 2.2) * 0.12;
      spr.scale.setScalar(s);
    }

    const newNear = bestD2 <= catchD2 ? closest : -1;
    if (newNear !== nearIndexRef.current) {
      nearIndexRef.current = newNear;
      setNearIndex(newNear);
    }
  });

  useEffect(() => {
    if (caughtCount === count && started) onComplete?.();
  }, [caughtCount, count, started, onComplete]);

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
            depthTest={false} // <- see through foliage
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}

      {/* Start overlay — enable pointer events on the Html wrapper */}
      {!started && (
        <Html fullscreen style={{ pointerEvents: "auto", zIndex: 1000 }}>
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,0,0,0.6)",
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

      {/* Intro overlay */}
      {!started && (
        <Html fullscreen style={{ pointerEvents: "auto", zIndex: 1000 }}>
          <div
            onClick={() => setStarted(true)} // <-- click anywhere to start
            style={{
              position: "fixed",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,0,0,0.6)",
              cursor: "pointer", // visual hint
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
                cursor: "auto", // normal cursor over card
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
                onClick={() => setStarted(true)} // button still works
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
    </group>
  );
}
