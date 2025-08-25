// EndOverlay.jsx
import React from "react";
import { Html } from "@react-three/drei";
import { userSettings } from "./stores/userSettings";

export default function EndOverlay() {
  const { theme, name, setStage } = userSettings();

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
  const accent = theme === "dark" ? "#10b981" : "#0ea5e9";

  return (
    <Html fullscreen zIndexRange={[2000, 3000]}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          background:
            theme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.6)",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "720px",
            maxWidth: "92vw",
            boxSizing: "border-box",
            borderRadius: 10,
            padding: "28px 32px",
            textAlign: "left",
            fontFamily: `"Courier New", monospace`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            ...panelStyle,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 8,
              color: accent,
            }}
          >
            WELL DONE{name ? `, ${name.toUpperCase()}` : ""}!
          </div>

          <p style={{ opacity: 0.9, marginBottom: 16, lineHeight: 1.45 }}>
            You’ve reached the end of the Forest of Facts. Thanks for playing.
          </p>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Tech & Credits
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>3D: react-three-fiber, drei, rapier</li>
              <li>Post: @react-three/postprocessing (Bloom)</li>
              <li>UI: React + inline styles</li>
              <li>Audio: HTMLAudioElement</li>
              <li>Models: (list your sources here)</li>
            </ul>
          </div>

          <p style={{ opacity: 0.9, marginBottom: 16 }}>
            Until next time — stay curious!
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => setStage("start")}
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: `1px solid ${accent}`,
                cursor: "pointer",
                fontWeight: 700,
                fontFamily: `"Courier New", monospace`,
                color: accent,
                background: "transparent",
              }}
            >
              RESTART
            </button>
          </div>
        </div>
      </div>
    </Html>
  );
}
