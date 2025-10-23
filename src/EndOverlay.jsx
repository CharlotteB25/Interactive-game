import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useNavigate } from "react-router-dom";
import { userSettings } from "./stores/userSettings";

/* -------- palette (same as yours) -------- */
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

/* -------- UI host rendered OUTSIDE the Canvas -------- */
function EndUI({ palette, name, onRestart }) {
  const styles = {
    shell: {
      position: "fixed",
      inset: 0,
      background: palette.scrim,
      pointerEvents: "auto",
    },
    panel: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
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
    },
    title: {
      fontWeight: 600,
      fontSize: 20,
      marginBottom: 10,
      color: palette.accent,
    },
    p: {
      fontSize: 14,
      color: palette.subtext,
      marginBottom: 16,
      lineHeight: 1.5,
    },
    creditsTitle: { fontWeight: 600, marginBottom: 6 },
    ul: { margin: 0, paddingLeft: 18, fontSize: 13 },
    actions: { display: "flex", gap: 8, justifyContent: "flex-end" },
    button: {
      padding: "10px 14px",
      borderRadius: 8,
      border: `1px solid ${palette.accent}`,
      background: "transparent",
      color: palette.accent,
      fontWeight: 600,
      fontFamily: palette.font,
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.shell}>
      <div style={styles.panel}>
        <div style={styles.title}>
          {"WELL DONE" + (name ? `, ${name.toUpperCase()}` : "")}!
        </div>

        <p style={styles.p}>
          You’ve reached the end of the Forest of Facts{name ? `, ${name}` : ""}
          . Thanks for playing.
        </p>

        <div style={{ marginBottom: 14 }}>
          <div style={styles.creditsTitle}>Tech & Credits</div>
          <ul style={styles.ul}>
            <li>3D: react-three-fiber, drei, rapier</li>
            <li>Post: @react-three/postprocessing (Bloom)</li>
            <li>UI: React + inline styles</li>
            <li>Audio: HTMLAudioElement</li>
            <li>
              Models: Alyona Shek (library); leifer.kopf (books); pezcurrel
              (guitar); scailman (plane); Oleg Muzyka (computer)
            </li>
            <li>
              Music: freesound.org — Migfus20, BurghRecords, PearceL, 5ro4
            </li>
          </ul>
        </div>

        <p style={styles.p}>
          Until next time — stay curious{name ? `, ${name}` : ""}!
        </p>

        <div style={styles.actions}>
          <button
            style={styles.button}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = palette.accentSubtle)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onClick={onRestart}
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------- exported overlay component -------- */
export default function EndOverlay() {
  const { theme, name, setStage } = userSettings();
  const palette = usePalette(theme);
  const navigate = useNavigate();

  // host + root
  const hostRef = useRef(null);
  const rootRef = useRef(null);

  // mount a fixed overlay root in <body>
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
      try {
        rootRef.current?.unmount();
      } catch {}
      if (hostRef.current?.parentNode)
        hostRef.current.parentNode.removeChild(hostRef.current);
    };
  }, []);

  const handleRestart = () => {
    // stop inputs/audio safely
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch {}
    }
    try {
      userSettings.getState()._stopMusicFromHUD?.();
    } catch {}

    // reset stage first (so guards on "/" see start)
    try {
      setStage?.("start");
    } catch {}
    try {
      userSettings.setState?.({ stage: "start" });
    } catch {}

    // navigate next frame, replace history
    requestAnimationFrame(() => {
      navigate("/", { replace: true });
      // optional: scroll top
      try {
        window.scrollTo({ top: 0 });
      } catch {}
    });
  };

  // render the UI into the out-of-canvas root
  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.render(
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <EndUI palette={palette} name={name} onRestart={handleRestart} />
      </div>
    );
  }, [palette, name]); // re-render when palette/name changes

  // IMPORTANT: return null so R3F never sees DOM nodes
  return null;
}
