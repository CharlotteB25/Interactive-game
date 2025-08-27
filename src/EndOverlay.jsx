import React, { useMemo, useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import { useNavigate } from "react-router-dom"; // ✅ add
import { userSettings } from "./stores/userSettings";

// Same palette hook (unchanged) ...
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
      scrim: dark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)",
      panel: dark ? "rgba(17,17,18,0.9)" : "rgba(248,248,249,0.9)",
      text: dark ? "#e6e7e9" : "#0b0d12",
      subtext: dark ? "rgba(230,231,233,0.7)" : "rgba(11,13,18,0.65)",
      accent,
      accentSubtle: dark ? "rgba(158,206,181,0.16)" : "rgba(37,99,235,0.08)",
      hairline: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      shadow: dark
        ? "0 8px 24px rgba(0,0,0,0.35)"
        : "0 8px 24px rgba(0,0,0,0.1)",
      font: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans"',
    };
  }, [dark]);
}

export default function EndOverlay() {
  const { theme, name, setStage } = userSettings();
  const palette = usePalette(theme);
  const navigate = useNavigate(); // ✅ add

  const handleRestart = () => {
    // Gracefully release input/audio before routing
    try {
      document.exitPointerLock?.();
    } catch {}
    try {
      userSettings.getState()._stopMusicFromHUD?.();
    } catch {}

    // Ensure state is back to "start" so StartOverlay shows on the home route
    setStage("start");

    // Go to your beginning route (adjust if your start route is different)
    navigate("/");
  };

  return (
    <Html fullscreen zIndexRange={[2000, 3000]}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: palette.scrim,
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-100%, -110%)", // keep your custom positioning
            width: "min(720px, 92vw)",
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
              marginBottom: 10,
              color: palette.accent,
            }}
          >
            WELL DONE{name ? `, ${name.toUpperCase()}` : ""}!
          </div>

          <p
            style={{
              fontSize: 14,
              color: palette.subtext,
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            You’ve reached the end of the Forest of Facts
            {name ? `, ${name}` : ""}. Thanks for playing.
          </p>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Tech & Credits
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
              <li>3D: react-three-fiber, drei, rapier</li>
              <li>Post: @react-three/postprocessing (Bloom)</li>
              <li>UI: React + inline styles</li>
              <li>Audio: HTMLAudioElement</li>
              <li>Models: (list your sources here)</li>
            </ul>
          </div>

          <p style={{ fontSize: 14, color: palette.subtext, marginBottom: 16 }}>
            Until next time — stay curious{name ? `, ${name}` : ""}!
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={handleRestart} // ✅ use handler
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${palette.accent}`,
                background: "transparent",
                color: palette.accent,
                fontWeight: 600,
                fontFamily: palette.font,
                cursor: "pointer",
              }}
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </Html>
  );
}
