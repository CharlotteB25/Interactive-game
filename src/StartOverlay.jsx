import React, { useRef } from "react";
import { Html } from "@react-three/drei";
import { userSettings } from "./stores/userSettings";

export default function StartOverlay() {
  const { name, theme, music, setName, setTheme, setMusic, setStage } =
    userSettings();
  const startBtnRef = useRef(null);

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

  // ✅ Start the central MusicManager audio in this trusted click
  const startExperience = async () => {
    try {
      // try to play the audio element that MusicManager prepared
      await userSettings.getState()._playMusicFromHUD?.();
    } catch (e) {
      // ignore autoplay errors
    }

    // (Optional) tiny next-tick retry in case MusicManager attaches a millisecond later
    setTimeout(() => userSettings.getState()._playMusicFromHUD?.(), 0);

    setStage("experience");
  };

  return (
    <Html fullscreen>
      {/* Full-screen veil */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            theme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.6)",
          pointerEvents: "auto",
          zIndex: 2147483647,
        }}
      >
        {/* Centered panel (absolute + translate) */}
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
              letterSpacing: 1,
            }}
          >
            WELCOME TO THE FOREST OF FACTS
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 8,
                height: 18,
                background: accent,
                marginLeft: 8,
                verticalAlign: "-2px",
                animation: "blink 1.2s steps(1,end) infinite",
              }}
            />
          </div>

          <p style={{ opacity: 0.9, marginBottom: 16, lineHeight: 1.45 }}>
            Explore, solve, and discover. Choose your mood, pick a soundtrack,
            and tell us your name — we’ll personalize title cards just for you.
          </p>

          <label style={{ fontSize: 13, opacity: 0.85 }}>Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name…"
            style={{
              width: "100%",
              marginTop: 6,
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 6,
              background:
                theme === "dark" ? "rgba(2,6,23,0.6)" : "rgba(241,245,249,0.8)",
              color: "inherit",
              border: `1px solid ${
                theme === "dark"
                  ? "rgba(148,163,184,0.35)"
                  : "rgba(15,23,42,0.25)"
              }`,
              outline: "none",
              fontFamily: `"Courier New", monospace`,
              fontSize: 14,
            }}
          />

          <div style={{ margin: "8px 0 14px 0" }}>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
              Theme
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setTheme("dark")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: `1px solid ${
                    theme === "dark" ? accent : "rgba(148,163,184,0.35)"
                  }`,
                  background:
                    theme === "dark" ? "rgba(16,185,129,0.10)" : "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme("light")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: `1px solid ${
                    theme === "light" ? accent : "rgba(148,163,184,0.35)"
                  }`,
                  background:
                    theme === "light" ? "rgba(14,165,233,0.10)" : "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                Light
              </button>
            </div>
          </div>

          <div style={{ margin: "8px 0 18px 0" }}>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
              Music
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                ["none", "No music"],
                ["backgroundMusic.wav", "Ambient Default"],
                ["backgroundMusicNature.wav", "Nature"],
                ["backgroundMusicPiano.mp3", "Piano"],
                ["backgroundMusicUpbeat.m4a", "Upbeat"],
              ].map(([val, label]) => (
                <label
                  key={val}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <input
                    type="radio"
                    name="music"
                    value={val}
                    checked={music === val}
                    onChange={() => setMusic(val)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              ref={startBtnRef}
              onClick={startExperience}
              style={{
                padding: "12px 18px",
                borderRadius: 6,
                border: `1px solid ${accent}`,
                cursor: "pointer",
                fontWeight: 700,
                fontFamily: `"Courier New", monospace`,
                color: accent,
                background: "transparent",
              }}
            >
              START EXPERIENCE
            </button>
          </div>

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
  );
}
