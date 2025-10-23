import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSimonStore } from "../stores/simonStore";
import { userSettings } from "../stores/userSettings";

import correctUrl from "../assets/sounds/rightAnswer.wav";
import wrongUrl from "../assets/sounds/wrongAnswer.mp3";

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
      scrim: dark ? "rgba(0,0,0,0.60)" : "rgba(255,255,255,0.60)",
      panel: dark ? "rgba(17,17,18,0.90)" : "rgba(248,248,249,0.90)",
      text: dark ? "#e6e7e9" : "#0b0d12",
      subtext: dark ? "rgba(230,231,233,0.70)" : "rgba(11,13,18,0.65)",
      accent,
      accentSubtle: dark ? "rgba(158,206,181,0.16)" : "rgba(37,99,235,0.08)",
      warn: dark ? "#f18f8f" : "#b91c1c",
      hairline: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      shadow: dark
        ? "0 8px 24px rgba(0,0,0,0.35)"
        : "0 8px 24px rgba(0,0,0,0.10)",
      font: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans"',
    };
  }, [dark]);
}

export default function SimonHUD({ theme = "system" }) {
  // Always call hooks in the same order
  const { stage: appStage, name } = userSettings();
  const palette = usePalette(theme);

  // Simon store hooks
  const stage = useSimonStore((s) => s.stage);
  const round = useSimonStore((s) => s.round);
  const revealing = useSimonStore((s) => s.revealing);
  const waiting = useSimonStore((s) => s.waiting);
  const nearIndex = useSimonStore((s) => s.nearIndex);

  const start = useSimonStore((s) => s.start);
  const replay = useSimonStore((s) => s.replay);
  const press = useSimonStore((s) => s.press);

  // ⭐ optional: gently reset Simon to "intro" each time experience starts
  useEffect(() => {
    // if your store has reset(), prefer that; otherwise safe partial set:
    try {
      useSimonStore.getState().reset?.();
    } catch {}
    try {
      useSimonStore.setState?.((prev) => ({
        ...prev,
        stage: "intro",
        // keep other fields if your store needs them
      }));
    } catch {}
    // run only when experience becomes active
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastStageRef = useRef(stage);
  const sfxUnlockedRef = useRef(false);

  const sfx = useMemo(
    () => ({
      correct: new Audio(correctUrl),
      wrong: new Audio(wrongUrl),
    }),
    []
  );

  useEffect(() => {
    Object.values(sfx).forEach((a) => {
      a.preload = "auto";
      try {
        a.load();
      } catch {}
    });
  }, [sfx]);

  useEffect(() => {
    const onFeedback = (e) => {
      const type = e.detail;
      const play = (a) => {
        try {
          a.currentTime = 0;
          a.play().catch(() => {});
        } catch {}
      };
      if (type === "correct") play(sfx.correct);
      if (type === "wrong") play(sfx.wrong);
    };
    window.addEventListener("simon-feedback", onFeedback);
    return () => window.removeEventListener("simon-feedback", onFeedback);
  }, [sfx]);

  useEffect(() => {
    if (lastStageRef.current !== "fail" && stage === "fail") {
      try {
        sfx.wrong.currentTime = 0;
        sfx.wrong.play().catch(() => {});
      } catch {}
    }
    lastStageRef.current = stage;
  }, [stage, sfx]);

  useEffect(() => {
    const onKey = (e) => {
      const isSpace =
        e.code === "Space" || e.key === " " || e.key === "Spacebar";
      if (!isSpace) return;
      if (stage !== "playing" || revealing || waiting) return;
      if (nearIndex !== -1) press(nearIndex);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, revealing, waiting, nearIndex, press]);

  const handleStart = async () => {
    if (!sfxUnlockedRef.current) {
      for (const a of [sfx.correct, sfx.wrong]) {
        try {
          const v = a.volume;
          a.volume = 0;
          await a.play();
          a.pause();
          a.currentTime = 0;
          a.volume = v;
        } catch {}
      }
      sfxUnlockedRef.current = true;
    }
    window.dispatchEvent(new Event("xr-play-music"));
    start();
  };

  // --- styles ---
  const panelBase = {
    background: palette.panel,
    color: palette.text,
    borderRadius: 10,
    padding: "18px 20px",
    fontFamily: palette.font,
    boxShadow: palette.shadow,
    border: `1px solid ${palette.hairline}`,
  };
  const titleStyle = { fontWeight: 600, fontSize: 14, letterSpacing: 0.3 };
  const subStyle = { fontSize: 13, color: palette.subtext, lineHeight: 1.45 };
  const buttonBase = {
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${palette.hairline}`,
    background: "transparent",
    color: palette.text,
    fontWeight: 600,
    fontFamily: palette.font,
    cursor: "pointer",
  };
  const buttonAccent = {
    ...buttonBase,
    border: `1px solid ${palette.accent}`,
    color: palette.accent,
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

  return (
    <>
      {stage === "intro" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: palette.scrim,
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              width: "min(92vw, 520px)",
              ...panelBase,
              textAlign: "center",
            }}
          >
            <div style={{ ...titleStyle, marginBottom: 8 }}>
              {"Simon Says" + (name ? `, ${name}` : "")}
            </div>
            <div style={{ ...subStyle, marginBottom: 16 }}>
              Watch the lights, then move near one and press{" "}
              <span style={{ fontWeight: 600 }}>Space</span> to repeat.
            </div>
            <button
              onClick={handleStart}
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
          </div>
        </div>
      )}

      {(stage === "playing" || stage === "fail") && (
        <div
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 999,
            pointerEvents: "auto",
          }}
        >
          <div style={{ ...panelBase, minWidth: 220, maxWidth: 320 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <div style={titleStyle}>
                {"Simon Says" + (name ? `, ${name}` : "")}
              </div>
              <div style={chip}>
                {stage === "fail" ? "Try again" : `Round ${round}`}
              </div>
            </div>

            {stage === "fail" ? (
              <>
                <div style={{ ...subStyle, marginTop: 6, color: palette.warn }}>
                  Not quite. Press <b>Restart</b> to replay the sequence.
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    justifyContent: "flex-end",
                  }}
                >
                  <button onClick={start} style={buttonBase}>
                    Restart
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ ...subStyle, marginTop: 4 }}>
                  {revealing
                    ? "Watching sequence…"
                    : nearIndex !== -1
                    ? "Press Space near a light"
                    : "Move closer to a light"}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={replay}
                    disabled={revealing}
                    style={{
                      ...buttonAccent,
                      opacity: revealing ? 0.5 : 1,
                      cursor: revealing ? "not-allowed" : "pointer",
                    }}
                  >
                    Replay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
