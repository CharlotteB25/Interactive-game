// ForestScene.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Physics } from "@react-three/rapier";
import Forest from "./components/Forest/Forest";
import ForestColliders from "./components/Forest/ForestCollider";
import Player from "./Player";
import FireflyCatch from "./components/FireflyCatch";
import BiosCluster from "./components/Bio/BiosCluster";
import { Environment, ContactShadows } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { userSettings } from "./stores/userSettings";
import EndOverlay from "./EndOverlay";
import MusicManager from "./MusicManager";
import { createRoot } from "react-dom/client";

/* --------- tiny palette helper (same colors you used) --------- */
function usePaletteFromTheme(theme = "system") {
  const dark = theme === "dark"; // if you have "system" logic elsewhere, plug it in
  const accent = dark ? "#9eceb5" : "#2563eb";
  const hairline = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const panel = dark ? "rgba(17,17,18,0.90)" : "rgba(248,248,249,0.90)";
  const text = dark ? "#e6e7e9" : "#0b0d12";
  const shadow = dark
    ? "0 8px 24px rgba(0,0,0,0.35)"
    : "0 8px 24px rgba(0,0,0,0.10)";
  const font =
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans"';
  const accentSubtle = dark ? "rgba(158,206,181,0.16)" : "rgba(37,99,235,0.10)";
  return { accent, hairline, panel, text, shadow, font, accentSubtle };
}

/* --------- Exit button UI rendered OUTSIDE the Canvas --------- */
function ExitUI({ visible, onExit, theme }) {
  const palette = usePaletteFromTheme(theme);
  const rootRef = useRef(null);
  const hostRef = useRef(null);

  // mount a fixed overlay host in <body>
  useEffect(() => {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.inset = "0";
    el.style.pointerEvents = "none";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
    hostRef.current = el;
    rootRef.current = createRoot(el);

    return () => {
      if (rootRef.current) rootRef.current.unmount();
      if (hostRef.current?.parentNode) {
        hostRef.current.parentNode.removeChild(hostRef.current);
      }
    };
  }, []);

  // render button whenever props change
  useEffect(() => {
    if (!rootRef.current) return;

    if (!visible) {
      // render nothing when hidden so it won't capture clicks
      rootRef.current.render(null);
      return;
    }

    rootRef.current.render(
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: "50%",

            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              background: palette.panel,
              color: palette.text,
              border: `1px solid ${palette.hairline}`,
              boxShadow: palette.shadow,
              borderRadius: 12,
              padding: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: palette.font,
            }}
          >
            <button
              onClick={onExit}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${palette.accent}`,
                background: "transparent",
                color: palette.accent,
                fontWeight: 600,
                fontFamily: palette.font,
                cursor: "pointer",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = palette.accentSubtle)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Exit Experience
            </button>
          </div>
        </div>
      </div>
    );
  }, [visible, onExit, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  // IMPORTANT: nothing DOM-like goes into the R3F tree
  return null;
}

export default function ForestScene() {
  const [firefliesCleared, setFirefliesCleared] = useState(false);
  const { theme, setStage, stage } = userSettings();

  const exitExperience = () => {
    try {
      document.exitPointerLock?.();
    } catch {}
    try {
      userSettings.getState()._stopMusicFromHUD?.();
    } catch {}
    setStage("end"); // show EndOverlay and pause world
  };

  return (
    <>
      {/* END overlay takes over when stage === "end" */}
      {stage === "end" && <EndOverlay />}

      {/* World only when NOT ended */}
      {stage !== "end" && (
        <>
          <MusicManager />
          <Perf position="top-left" />
          <Environment preset="night" background blur={0.25} intensity={0.8} />
          <directionalLight
            position={[-6, 12, -4]}
            intensity={1.8}
            color="#a8c7ff"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <hemisphereLight
            skyColor="#88aaff"
            groundColor="#223344"
            intensity={0.35}
          />
          <directionalLight
            position={[6, 4, 6]}
            intensity={0.5}
            color="#ffd7a8"
          />
          <ContactShadows
            position={[0, -0.01, 0]}
            scale={80}
            far={20}
            blur={2.2}
            opacity={0.35}
            resolution={256}
            frames={1}
          />

          <Physics gravity={[0, -9.81, 0]}>
            <Player position={[0, 1.6, 0]} />
            <Forest
              position={[0, 0, 0]}
              envMapIntensity={1.0}
              hideSkydomes
              stripLights
              stripFog
              debug
              forceHide={["Object_8"]}
              hideLargestMeshes={1}
              largestMinRadius={50}
            />
            <ForestColliders
              items={[
                { name: "ground", size: [50, 1, 50], position: [0, -0.2, 0] },
                { name: "wall-north", size: [50, 5, 2], position: [0, 2, 25] },
                { name: "wall-south", size: [60, 5, 2], position: [0, 2, -25] },
                { name: "wall-east", size: [2, 5, 60], position: [25, 2, 0] },
                { name: "wall-west", size: [2, 5, 60], position: [-25, 2, 0] },
              ]}
              showDebug={false}
            />
          </Physics>

          {/* Firefly mini-game */}
          {!firefliesCleared && (
            <FireflyCatch
              count={8}
              areaRadius={10}
              onComplete={() => setFirefliesCleared(true)}
            />
          )}

          {/* Bios cluster after fireflies */}
          {firefliesCleared && <BiosCluster />}

          {/* Exit UI (outside Canvas via separate root) */}
          <ExitUI
            visible={firefliesCleared}
            onExit={exitExperience}
            theme={theme}
          />
        </>
      )}
    </>
  );
}
