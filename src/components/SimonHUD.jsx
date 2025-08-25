// components/SimonHUD.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useSimonStore } from "../stores/simonStore";

// ✅ import the actual files from src/assets so Vite serves them correctly
import correctUrl from "../assets/sounds/rightAnswer.wav";
import wrongUrl from "../assets/sounds/wrongAnswer.mp3";

export default function SimonHUD() {
  const stage = useSimonStore((s) => s.stage);
  const round = useSimonStore((s) => s.round);
  const revealing = useSimonStore((s) => s.revealing);
  const waiting = useSimonStore((s) => s.waiting);
  const nearIndex = useSimonStore((s) => s.nearIndex);

  const start = useSimonStore((s) => s.start);
  const replay = useSimonStore((s) => s.replay);
  const press = useSimonStore((s) => s.press);

  const lastStageRef = useRef(stage);
  const sfxUnlockedRef = useRef(false);

  // 🎵 build audio elements from imported URLs
  const sfx = useMemo(
    () => ({
      correct: new Audio(correctUrl),
      wrong: new Audio(wrongUrl),
    }),
    []
  );

  // Preload for snappy first play
  useEffect(() => {
    Object.values(sfx).forEach((a) => {
      a.preload = "auto";
      try {
        a.load();
      } catch {}
    });
  }, [sfx]);

  // 🔊 react to feedback events emitted from the store (press() -> emitFeedback)
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
      // (optional) you can also handle "round"/"complete" here if you add sounds for them
    };
    window.addEventListener("simon-feedback", onFeedback);
    return () => window.removeEventListener("simon-feedback", onFeedback);
  }, [sfx]);

  // Play "wrong" if stage flips to fail (extra safety net)
  useEffect(() => {
    if (lastStageRef.current !== "fail" && stage === "fail") {
      try {
        sfx.wrong.currentTime = 0;
        sfx.wrong.play().catch(() => {});
      } catch {}
    }
    lastStageRef.current = stage;
  }, [stage, sfx]);

  // Spacebar input -> only triggers press(), no SFX here (SFX comes from feedback)
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

  // Start button: unlock audio once and kick off the game + music
  const handleStart = async () => {
    if (!sfxUnlockedRef.current) {
      for (const a of [sfx.correct, sfx.wrong]) {
        try {
          const v = a.volume;
          a.volume = 0;
          // eslint-disable-next-line no-await-in-loop
          await a.play(); // unlock
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

  return (
    <>
      {stage === "intro" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              width: "min(92vw, 520px)",
              background: "rgba(0,0,0,0.85)",
              color: "#e2e8f0",
              borderRadius: 10,
              padding: "28px 32px",
              textAlign: "center",
              fontFamily: `"Courier New", monospace`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 12,
                color: "#10b981",
                letterSpacing: 1,
              }}
            >
              SIMON SAYS
            </div>
            <div
              style={{
                fontSize: 15,
                opacity: 0.85,
                marginBottom: 20,
                lineHeight: 1.4,
              }}
            >
              Watch the lights pulse in order, then walk near a light and press{" "}
              <b>Space</b> to repeat the sequence.
            </div>
            <button
              onClick={handleStart}
              style={{
                padding: "12px 18px",
                borderRadius: 6,
                border: "1px solid #10b981",
                cursor: "pointer",
                fontWeight: 600,
                fontFamily: `"Courier New", monospace`,
                color: "#10b981",
                background: "transparent",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(16,185,129,0.1)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              START
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
          <div
            style={{
              background: "rgba(0,0,0,0.85)",
              color: "#f1f5f9",
              padding: "12px 14px",
              borderRadius: 8,
              fontSize: 13,
              lineHeight: 1.4,
              minWidth: 240,
              maxWidth: 320,
              fontFamily: `"Courier New", monospace`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <div style={{ fontWeight: 700, color: "#10b981" }}>
                SIMON SAYS
              </div>
              <div style={{ opacity: 0.85 }}>
                {stage === "fail" ? "TRY AGAIN" : `ROUND ${round}`}
              </div>
            </div>

            {stage === "fail" ? (
              <>
                <div style={{ marginTop: 6, color: "#f87171" }}>
                  ❌ Not quite. Press <b>Restart</b> to replay the sequence.
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={start}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #f87171",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontFamily: `"Courier New", monospace`,
                      color: "#f87171",
                      background: "transparent",
                    }}
                  >
                    Restart
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  {revealing
                    ? "Watching sequence…"
                    : nearIndex !== -1
                    ? "Press SPACE near a light"
                    : "Move closer to a light"}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    onClick={replay}
                    disabled={revealing}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: revealing
                        ? "1px solid #64748b"
                        : "1px solid #10b981",
                      cursor: revealing ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontFamily: `"Courier New", monospace`,
                      color: revealing ? "#64748b" : "#10b981",
                      background: "transparent",
                    }}
                  >
                    Replay sequence
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
