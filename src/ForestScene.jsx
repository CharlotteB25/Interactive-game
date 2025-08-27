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
import EndOverlay from "./EndOverlay"; // ✅ render it here too
import MusicManager from "./MusicManager";

export default function ForestScene() {
  const [firefliesCleared, setFirefliesCleared] = useState(false);
  const { theme, setStage, stage } = userSettings();

  // minimalist palette bits for the button
  const accent = theme === "dark" ? "#9eceb5" : "#2563eb";
  const hairline =
    theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const panel =
    theme === "dark" ? "rgba(17,17,18,0.90)" : "rgba(248,248,249,0.90)";
  const text = theme === "dark" ? "#e6e7e9" : "#0b0d12";
  const shadow =
    theme === "dark"
      ? "0 8px 24px rgba(0,0,0,0.35)"
      : "0 8px 24px rgba(0,0,0,0.10)";
  const font =
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans"';
  const accentSubtle =
    theme === "dark" ? "rgba(158,206,181,0.16)" : "rgba(37,99,235,0.10)";

  const exitExperience = () => {
    try {
      document.exitPointerLock?.();
    } catch {}
    try {
      userSettings.getState()._stopMusicFromHUD?.();
    } catch {}
    // ❌ no navigate() here
    setStage("end"); // ✅ show EndOverlay and pause world
  };

  return (
    <>
      {/* If stage === 'end', just show the overlay and nothing else */}
      {stage === "end" && <EndOverlay />}

      {/* World only renders when NOT in 'end' */}
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

          {/* Fixed Exit button (top-right) */}
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
                <div
                  style={{
                    background: panel,
                    color: text,
                    border: `1px solid ${hairline}`,
                    boxShadow: shadow,
                    borderRadius: 12,
                    padding: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: font,
                  }}
                >
                  <button
                    onClick={exitExperience}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1px solid ${accent}`,
                      background: "transparent",
                      color: accent,
                      fontWeight: 600,
                      fontFamily: font,
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = accentSubtle)
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    Exit Experience
                  </button>
                </div>
              </div>
            </Html>
          )}
        </>
      )}
    </>
  );
}
