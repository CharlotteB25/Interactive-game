import React, { useEffect } from "react";
import { useSimonStore } from "../stores/simonStore";

export default function SimonHUD() {
  const stage = useSimonStore((s) => s.stage);
  const round = useSimonStore((s) => s.round);
  const revealing = useSimonStore((s) => s.revealing);
  const nearIndex = useSimonStore((s) => s.nearIndex);

  const start = useSimonStore((s) => s.start);
  const replay = useSimonStore((s) => s.replay);
  const press = useSimonStore((s) => s.press);

  // Space input handled here (global, not in 3D)
  useEffect(() => {
    const onKey = (e) => {
      const isSpace =
        e.code === "Space" || e.key === " " || e.key === "Spacebar";
      if (!isSpace) return;
      if (stage !== "playing" || revealing) return;
      if (nearIndex !== -1) press(nearIndex);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, revealing, nearIndex, press]);

  return (
    <>
      {/* INTRO fullscreen (like a modal) */}
      {stage === "intro" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              width: "min(92vw, 520px)",
              background: "white",
              color: "#111",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              padding: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              Simon Says
            </div>
            <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>
              Watch the lights pulse in order, then walk near a light and press
              Space to repeat the sequence.
            </div>
            <button
              onClick={start}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: 0,
                cursor: "pointer",
                fontWeight: 600,
                color: "white",
                background: "#4f46e5",
                minWidth: 140,
              }}
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* PINNED HUD (top-right) for PLAYING and FAIL */}
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
              background: "rgba(17,17,17,0.92)",
              color: "white",
              padding: "10px 12px",
              borderRadius: 10,
              fontSize: 12,
              lineHeight: 1.35,
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              minWidth: 240,
              maxWidth: 320,
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 700 }}>Simon Says</div>
              <div style={{ opacity: 0.85 }}>
                {stage === "fail" ? "Try again" : `Round ${round}`}
              </div>
            </div>

            {stage === "fail" ? (
              <>
                <div style={{ marginTop: 6, color: "#fecaca" }}>
                  ❌ Not quite. Press <b>Restart</b> to replay the sequence.
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={start}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: 0,
                      cursor: "pointer",
                      fontWeight: 600,
                      background: "#ef4444",
                      color: "white",
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
                    ? "Press Space near a light"
                    : "Move closer to a light"}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={replay}
                    disabled={revealing}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: 0,
                      cursor: revealing ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      background: revealing ? "#4b5563" : "#10b981",
                      color: "white",
                      opacity: revealing ? 0.7 : 1,
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
