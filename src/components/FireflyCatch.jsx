import React, { useEffect, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { userSettings } from "../stores/userSettings";

/* ---------- Minimal palette (same as Start/End/HUD) ---------- */
function usePalette(theme = "system") {
  const [sysDark, setSysDark] = useState(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    if (theme !== "system" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSysDark(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [theme]);

  const dark = theme === "dark" || (theme === "system" && sysDark);

  return useMemo(() => {
    const accent = dark ? "#9eceb5" : "#2563eb";
    return {
      dark,
      scrim: dark ? "rgba(0,0,0,0.60)" : "rgba(255,255,255,0.60)",
      panel: dark ? "rgba(17,17,18,0.90)" : "rgba(248,248,249,0.90)",
      text: dark ? "#e6e7e9" : "#0b0d12",
      subtext: dark ? "rgba(230,231,233,0.70)" : "rgba(11,13,18,0.65)",
      accent,
      accentSubtle: dark ? "rgba(158,206,181,0.16)" : "rgba(37,99,235,0.10)",
      hairline: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      shadow: dark
        ? "0 8px 24px rgba(0,0,0,0.35)"
        : "0 8px 24px rgba(0,0,0,0.10)",
      font: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans"',
    };
  }, [dark]);
}

/* ---------- Glow texture for sprites ---------- */
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
  areaRadius = 12,
  minY = 1.2,
  maxY = 3.6,
  catchDistance = 2.5,
  maxVisibleDistance = 60,
  onComplete,
}) {
  const { camera } = useThree();
  const { name, theme } = userSettings(); // ✅ get name + theme for personalization & palette
  const palette = usePalette(theme);

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

      // visibility + catch
      const dx = cam.x - x,
        dy = cam.y - y,
        dz = cam.z - z;
      const d2 = dx * dx + dy * dy + dz * dz;
      spr.visible = d2 < visD2;

      if (stage === "playing" && d2 <= catchD2) {
        setCaught((prev) => {
          if (prev[i]) return prev;
          const next = prev.slice();
          next[i] = true;
          return next;
        });
      }

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

  // --------- shared UI styles ----------
  const panelBase = {
    background: palette.panel,
    color: palette.text,
    borderRadius: 12,
    padding: "24px 28px",
    fontFamily: palette.font,
    boxShadow: palette.shadow,
    border: `1px solid ${palette.hairline}`,
    width: "min(520px, 92vw)",
    textAlign: "center",
    boxSizing: "border-box",
  };

  const titleStyle = {
    fontWeight: 600,
    fontSize: 20,
    marginBottom: 10,
    color: palette.accent,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    letterSpacing: 0.3,
  };

  const subStyle = {
    fontSize: 14,
    color: palette.subtext,
    lineHeight: 1.5,
    marginBottom: 16,
  };

  const buttonAccent = {
    padding: "10px 16px",
    borderRadius: 10,
    border: `1px solid ${palette.accent}`,
    background: "transparent",
    color: palette.accent,
    fontWeight: 600,
    fontFamily: palette.font,
    cursor: "pointer",
  };

  const hudPanel = {
    background: palette.panel,
    color: palette.text,
    padding: "12px 14px",
    borderRadius: 10,
    fontSize: 13,
    lineHeight: 1.4,
    minWidth: 220,
    fontFamily: palette.font,
    boxShadow: palette.shadow,
    border: `1px solid ${palette.hairline}`,
  };

  const chip = {
    padding: "2px 8px",
    borderRadius: 999,
    border: `1px solid ${palette.hairline}`,
    background: palette.accentSubtle,
    color: palette.text,
    fontSize: 12,
    fontWeight: 500,
  };

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

      {/* INTRO overlay (minimalist) */}
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
              background: palette.scrim,
            }}
          >
            <div style={panelBase}>
              <div style={titleStyle}>
                Firefly Catch{name ? `, ${name}` : ""}
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 18,
                    background: palette.accent,
                    animation: "blink 1.2s steps(1,end) infinite",
                  }}
                />
              </div>

              <div style={subStyle}>
                Chase the glowing fireflies and walk through them to collect.
                <br />
                Collect all <b>{count}</b> to proceed.
              </div>

              <button
                onClick={() => setStage("playing")}
                style={buttonAccent}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = palette.accentSubtle)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Start
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

      {/* HUD while playing (top-right) */}
      {stage === "playing" && (
        <Html
          fullscreen
          zIndexRange={[900, 2000]}
          style={{ pointerEvents: "auto" }}
        >
          <div style={{ position: "fixed", top: 12, right: 12 }}>
            <div style={hudPanel}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  Firefly Catch{name ? `, ${name}` : ""}
                </div>
                <div style={chip}>
                  {caughtCount} / {count}
                </div>
              </div>
              <div style={{ color: palette.subtext }}>
                Walk through a firefly to collect it.
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
