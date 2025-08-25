// ForestScene.jsx
import React, { useState } from "react";
import { Physics } from "@react-three/rapier";
import Forest from "./components/Forest/Forest";
import ForestColliders from "./components/Forest/ForestCollider";
import Player from "./Player";
import FireflyCatch from "./components/FireflyCatch";
import BiosCluster from "./components/Bio/BiosCluster";
import { Environment, ContactShadows, Html } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { userSettings } from "./stores/userSettings";
import { useNavigate } from "react-router-dom";

export default function ForestScene() {
  // ✅ hooks in a fixed order
  const [firefliesCleared, setFirefliesCleared] = useState(false);
  const { theme, setStage } = userSettings();
  const navigate = useNavigate();

  // purely data
  const colliders = [
    { name: "ground", size: [50, 1, 50], position: [0, -0.2, 0] },
    { name: "wall-north", size: [50, 5, 2], position: [0, 2, 25] },
    { name: "wall-south", size: [60, 5, 2], position: [0, 2, -25] },
    { name: "wall-east", size: [2, 5, 60], position: [25, 2, 0] },
    { name: "wall-west", size: [2, 5, 60], position: [-25, 2, 0] },
  ];

  const accent = theme === "dark" ? "#10b981" : "#0ea5e9";
  const panelStyle =
    theme === "dark"
      ? {
          background: "rgba(0,0,0,0.85)",
          color: "#e2e8f0",
          border: "1px solid rgba(148,163,184,0.2)",
        }
      : {
          background: "rgba(255,255,255,0.9)",
          color: "#0f172a",
          border: "1px solid rgba(15,23,42,0.15)",
        };

  const exitExperience = () => {
    // gracefully leave pointer-lock + music before routing
    try {
      document.exitPointerLock?.();
    } catch {}
    try {
      userSettings.getState()._stopMusicFromHUD?.();
    } catch {}
    setStage("end"); // let <Experience/> show <EndOverlay/>
    navigate("/"); // go back to the route where Experience is mounted
  };

  return (
    <>
      {/* Lighting */}
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

      {/* World + physics */}
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
        <ForestColliders items={colliders} showDebug={false} />
      </Physics>

      {/* Firefly mini-game (self-contained overlays/HUD) */}
      {!firefliesCleared && (
        <FireflyCatch
          count={8}
          areaRadius={10}
          onComplete={() => setFirefliesCleared(true)}
        />
      )}

      {/* Forest of Facts */}
      {firefliesCleared && <BiosCluster />}

      {/* Exit Experience button (DOM overlay, not in R3F tree) */}
      {firefliesCleared && (
        <Html
          fullscreen
          zIndexRange={[1000, 2000]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              position: "fixed",
              top: 12,
              right: 12,
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={exitExperience}
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: `1px solid ${accent}`,
                cursor: "pointer",
                fontWeight: 700,
                fontFamily: `"Courier New", monospace`,
                color: accent,
                background: "transparent",
                transition: "all 0.2s ease",
                ...panelStyle,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background =
                  theme === "dark"
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(14,165,233,0.1)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = panelStyle.background)
              }
            >
              EXIT EXPERIENCE
            </button>
          </div>
        </Html>
      )}
    </>
  );
}
