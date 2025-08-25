import React, { useEffect, useState, useMemo, useRef } from "react";
import { useGameFlow } from "../../GameFlow";

const COLORS = [
  { key: "green", hex: "#22c55e" },
  { key: "red", hex: "#ef4444" },
  { key: "yellow", hex: "#eab308" },
  { key: "blue", hex: "#3b82f6" },
];

function useSimon({
  startLength = 3,
  maxLength = 5,

  // ⬇️ new timing controls
  initialDelay = 1200, // delay before FIRST reveal
  betweenRoundsDelay = 1200, // delay before reveal of NEXT round
  revealPace = 700, // ms between flashes during reveal
  flashMs = 450, // how long a pad stays lit during reveal
  postRevealGap = 350, // tiny gap after reveal before input opens

  onFeedback, // 'correct' | 'wrong' | 'round' | 'complete'
}) {
  const [sequence, setSequence] = useState([]);
  const [revealing, setRevealing] = useState(false);
  const [waiting, setWaiting] = useState(false); // gates input before reveal / between rounds / post-reveal
  const [activeIdx, setActiveIdx] = useState(-1); // flashing during reveal
  const [pressedIdx, setPressedIdx] = useState(-1); // user press highlight
  const [inputIdx, setInputIdx] = useState(0);
  const [round, setRound] = useState(1);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState(false);
  const [feedback, setFeedback] = useState("idle");

  const intervalRef = useRef(null);
  const timeoutRefs = useRef(new Set());

  const clearAllTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timeoutRefs.current.forEach((t) => clearTimeout(t));
    timeoutRefs.current.clear();
  };

  const addTimeout = (fn, ms) => {
    const t = setTimeout(() => {
      timeoutRefs.current.delete(t);
      fn();
    }, ms);
    timeoutRefs.current.add(t);
    return t;
  };

  const generate = (L) =>
    Array.from({ length: L }, () => Math.floor(Math.random() * 4));

  const scheduleReveal = (delayMs) => {
    setWaiting(true);
    setFeedback("idle");
    setActiveIdx(-1);
    addTimeout(() => {
      setWaiting(false);
      setRevealing(true);
    }, delayMs);
  };

  const start = (L = startLength) => {
    clearAllTimers();
    setError(false);
    setComplete(false);
    setRound(1);
    setSequence(generate(L));
    setInputIdx(0);
    setActiveIdx(-1);
    setPressedIdx(-1);
    scheduleReveal(initialDelay); // ⬅️ initial delay before first reveal
  };

  useEffect(() => {
    start(startLength);
    return clearAllTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reveal logic
  useEffect(() => {
    if (!revealing || !sequence.length) return;

    let i = -1;

    const tick = () => {
      i++;
      if (i >= sequence.length) {
        setActiveIdx(-1);
        setRevealing(false);
        // ⬇️ slight gap before input becomes active
        setWaiting(true);
        addTimeout(() => setWaiting(false), postRevealGap);
        return;
      }
      const idx = sequence[i];
      setActiveIdx(idx);

      // turn off after flashMs
      addTimeout(() => setActiveIdx(-1), flashMs);
    };

    tick();
    intervalRef.current = setInterval(tick, revealPace);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [revealing, sequence, revealPace, flashMs, postRevealGap]);

  const press = (idx) => {
    if (revealing || waiting || complete) return;

    // visual tap feedback
    setPressedIdx(idx);
    addTimeout(() => setPressedIdx(-1), 120);

    if (sequence[inputIdx] === idx) {
      setFeedback("correct");
      onFeedback?.("correct");

      if (inputIdx + 1 === sequence.length) {
        // round finished
        if (sequence.length >= maxLength) {
          setComplete(true);
          setFeedback("roundComplete");
          onFeedback?.("complete");
        } else {
          setRound((r) => r + 1);
          setSequence((prev) => [...prev, Math.floor(Math.random() * 4)]);
          setInputIdx(0);
          setError(false);
          setFeedback("roundComplete");
          onFeedback?.("round");
          scheduleReveal(betweenRoundsDelay); // ⬅️ gap before next reveal
        }
      } else {
        // advance within the round
        setInputIdx((i) => i + 1);
      }
    } else {
      // wrong input: restart same round (same length)
      setError(true);
      setFeedback("wrong");
      onFeedback?.("wrong");
      setInputIdx(0);
      scheduleReveal(betweenRoundsDelay);
    }
  };

  return {
    activeIdx,
    pressedIdx,
    press,
    round,
    complete,
    error,
    feedback,
    inputProgress: inputIdx,
    sequenceLength: sequence.length,
    waiting,
    restart: () => start(startLength),
  };
}

export default function SimonGate() {
  const { setSimonComplete } = useGameFlow();

  // 🎵 Preload & unlock SFX; ensure file names match your /public/sounds/
  const sfx = useMemo(
    () => ({
      correct: new Audio("/sounds/rightAnswer.wav"),
      wrong: new Audio("/sounds/wrongAnswer.wav"), // ← use .wav if that’s your file
    }),
    []
  );

  // Preload for faster first play
  useEffect(() => {
    Object.values(sfx).forEach((a) => {
      a.preload = "auto";
      try {
        a.load();
      } catch {}
    });
  }, [sfx]);

  // Unlock on first gesture so play() isn’t blocked by autoplay policies
  useEffect(() => {
    const unlock = () => {
      const audios = Object.values(sfx);
      // try to play & immediately pause to grant permission
      audios.forEach((a) => {
        a.volume = a.volume ?? 1;
        a.play()
          .then(() => {
            a.pause();
            a.currentTime = 0;
          })
          .catch(() => {});
      });
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [sfx]);

  const onFeedback = (type) => {
    const play = (a) => {
      try {
        a.currentTime = 0;
        a.play().catch(() => {});
      } catch {}
    };
    if (type === "correct") play(sfx.correct);
    if (type === "wrong") play(sfx.wrong);
  };

  const {
    activeIdx,
    pressedIdx,
    press,
    round,
    complete,
    error,
    feedback,
    inputProgress,
    sequenceLength,
    waiting,
    restart,
  } = useSimon({
    startLength: 3,
    maxLength: 5,
    initialDelay: 1200, // feel free to tweak
    betweenRoundsDelay: 1200,
    revealPace: 700,
    flashMs: 450,
    postRevealGap: 350,
    onFeedback,
  });

  useEffect(() => {
    if (complete) setSimonComplete(true);
  }, [complete, setSimonComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        background:
          "radial-gradient(ellipse at center, rgba(0,0,0,0.55), rgba(0,0,0,0.8))",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 9rem)",
          gap: "1rem",
        }}
      >
        {COLORS.map((c, i) => {
          const isActive = i === activeIdx || i === pressedIdx;
          return (
            <button
              key={c.key}
              onClick={() => press(i)}
              style={{
                width: "9rem",
                height: "9rem",
                borderRadius: "1rem",
                background: c.hex,
                boxShadow: isActive
                  ? `0 0 30px 8px ${c.hex}`
                  : "0 8px 20px rgba(0,0,0,0.35)",
                outline: "none",
                border: "0",
                transform: isActive ? "scale(1.03)" : "scale(1)",
                transition: "transform 120ms ease, box-shadow 120ms ease",
                cursor: "pointer",
              }}
              aria-label={`Pad ${c.key}`}
            />
          );
        })}
      </div>

      {/* HUD */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.9)",
          color: "#111",
          borderRadius: 14,
          padding: "10px 14px",
          fontSize: 14,
          textAlign: "center",
          minWidth: 280,
          fontFamily: `"Sour Gummy", "Courier New", monospace`,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        <div style={{ fontWeight: 600 }}>Simon Says</div>
        <div>Round {round}</div>

        {/* Status line */}
        {waiting && <div style={{ marginTop: 4 }}>Get ready…</div>}
        {!waiting &&
          (error ? (
            <div style={{ color: "#b91c1c", marginTop: 4 }}>
              Oops — restarting the round.
            </div>
          ) : feedback === "correct" ? (
            <div style={{ color: "#166534", marginTop: 4 }}>
              Nice! Keep going…
            </div>
          ) : feedback === "roundComplete" && !complete ? (
            <div style={{ color: "#0f766e", marginTop: 4 }}>
              Round complete — new step added.
            </div>
          ) : null)}

        {/* Progress during input */}
        {!waiting && !complete && (
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Progress: {inputProgress}/{sequenceLength}
          </div>
        )}

        {complete && (
          <div style={{ color: "#166534", marginTop: 6 }}>Unlocked!</div>
        )}

        <button
          onClick={restart}
          style={{
            marginTop: 8,
            fontSize: 12,
            background: "#111",
            color: "white",
            border: 0,
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
            fontFamily: `"Sour Gummy", "Courier New", monospace`,
          }}
        >
          Restart
        </button>
      </div>
    </div>
  );
}
