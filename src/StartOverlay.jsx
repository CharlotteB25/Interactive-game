import React, { useRef, useMemo, useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import { userSettings } from "./stores/userSettings";

// Palette hook (same as before)
function usePalette(theme = "system") {
  const [sysDark, setSysDark] = useState(
    typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
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
      scrim: dark ? "rgb(0,0,0,0)" : "rgb(255,255,255)",
      panel: dark ? "rgb(17,17,18)" : "rgb(248,248,249)",
      text: dark ? "#e6e7e9" : "#0b0d12",
      subtext: dark ? "rgb(230,231,233)" : "rgb(11,13,18)",
      accent,
      accentSubtle: dark ? "rgb(158,206,181,0.16)" : "rgb(37,99,235,0.10)",
      hairline: dark ? "rgb(255,255,255,0.06)" : "rgb(0,0,0,0.06)",
      shadow: dark ? "0 8px 24px rgb(0,0,0)" : "0 8px 24px rgb(0,0,0)",
      font: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans"',
    };
  }, [dark]);
}

export default function StartOverlay() {
  const { name, theme, music, setName, setTheme, setMusic, setStage } =
    userSettings();
  const startBtnRef = useRef(null);
  const palette = usePalette(theme);

  const startExperience = async () => {
    try {
      await userSettings.getState()._playMusicFromHUD?.();
    } catch {}
    setTimeout(() => userSettings.getState()._playMusicFromHUD?.(), 0);
    setStage("experience");
  };

  return (
    <Html fullscreen>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: palette.scrim,
          pointerEvents: "auto",
          zIndex: 2147483647,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "min(720px, 92vw)",
            transform: "translate(-80%, -80%)",
            borderRadius: 12,
            padding: "24px 28px",
            fontFamily: palette.font,
            background: palette.panel,
            color: palette.text,
            boxShadow: palette.shadow,
            border: `1px solid ${palette.hairline}`,
            boxSizing: "border-box",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 20,
              marginBottom: 8,
              color: palette.accent,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Welcome to the Forest of Facts
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

          <p
            style={{
              fontSize: 14,
              color: palette.subtext,
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            Explore, solve, and discover. Choose your mood, pick a soundtrack,
            and add your name for a personal touch. Move around with WASD keys
            and use your mouse to look around. When you do need to click on
            something press esc and then use your mouse as normal. Enjoy the
            journey!
          </p>

          {/* Name input */}
          <label style={{ fontSize: 13, color: palette.subtext }}>
            Your name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name…"
            style={{
              width: "100%",
              marginTop: 6,
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 8,
              background: palette.dark ? "rgba(2,6,23)" : "rgba(241,245,249)",
              color: palette.text,
              border: `1px solid ${palette.hairline}`,
              outline: "none",
              fontFamily: palette.font,
              fontSize: 14,
            }}
          />

          {/* Theme buttons */}
          <div style={{ margin: "8px 0 14px 0" }}>
            <div
              style={{ fontSize: 13, color: palette.subtext, marginBottom: 6 }}
            >
              Theme
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setTheme("dark")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${
                    theme === "dark" ? palette.accent : palette.hairline
                  }`,
                  background:
                    theme === "dark" ? palette.accentSubtle : "transparent",
                  color: palette.text,
                  fontFamily: palette.font,
                  cursor: "pointer",
                }}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme("light")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${
                    theme === "light" ? palette.accent : palette.hairline
                  }`,
                  background:
                    theme === "light" ? palette.accentSubtle : "transparent",
                  color: palette.text,
                  fontFamily: palette.font,
                  cursor: "pointer",
                }}
              >
                Light
              </button>
            </div>
          </div>

          {/* Music selector */}
          <div style={{ margin: "8px 0 18px 0" }}>
            <div
              style={{ fontSize: 13, color: palette.subtext, marginBottom: 6 }}
            >
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

          {/* Start button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              ref={startBtnRef}
              onClick={startExperience}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: `1px solid ${palette.accent}`,
                background: "transparent",
                color: palette.accent,
                fontWeight: 600,
                fontFamily: palette.font,
                cursor: "pointer",
              }}
            >
              Start Experience
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
