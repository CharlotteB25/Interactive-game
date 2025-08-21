import React, { useEffect, useState } from "react";
import { useGameFlow } from "../../GameFlow";

const COLORS = [
  { key: "green", hex: "#22c55e" },
  { key: "red", hex: "#ef4444" },
  { key: "yellow", hex: "#eab308" },
  { key: "blue", hex: "#3b82f6" },
];

function useSimon({ startLength = 3, maxLength = 5 }) {
  const [sequence, setSequence] = useState([]);
  const [revealing, setRevealing] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [inputIdx, setInputIdx] = useState(0);
  const [round, setRound] = useState(1);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState(false);

  const generate = (L) =>
    Array.from({ length: L }, () => Math.floor(Math.random() * 4));
  const start = (L = startLength) => {
    setError(false);
    setSequence(generate(L));
    setInputIdx(0);
    setRevealing(true);
    setActiveIdx(-1);
  };

  useEffect(() => {
    start(startLength); /* eslint-disable-next-line */
  }, []);

  useEffect(() => {
    if (!revealing || !sequence.length) return;
    let i = -1;
    const pace = 650;
    const tick = () => {
      i++;
      if (i >= sequence.length) {
        setActiveIdx(-1);
        setRevealing(false);
        return;
      }
      setActiveIdx(sequence[i]);
      setTimeout(() => setActiveIdx(-1), 450);
    };
    tick();
    const int = setInterval(tick, pace);
    return () => clearInterval(int);
  }, [revealing, sequence]);

  const press = (idx) => {
    if (revealing || complete) return;
    if (sequence[inputIdx] === idx) {
      if (inputIdx + 1 === sequence.length) {
        if (sequence.length >= maxLength) setComplete(true);
        else {
          setRound((r) => r + 1);
          setSequence((prev) => [...prev, Math.floor(Math.random() * 4)]);
          setInputIdx(0);
          setRevealing(true);
        }
      } else setInputIdx((i) => i + 1);
    } else {
      setError(true);
      setInputIdx(0);
      setRevealing(true);
    }
  };

  return {
    activeIdx,
    press,
    round,
    complete,
    error,
    restart: () => start(startLength),
  };
}

export default function SimonGate() {
  const { setSimonComplete } = useGameFlow();
  const { activeIdx, press, round, complete, error, restart } = useSimon({
    startLength: 3,
    maxLength: 5,
  });

  useEffect(() => {
    if (complete) setSimonComplete(true);
  }, [complete, setSimonComplete]);

  // Fullscreen overlay UI
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
        {COLORS.map((c, i) => (
          <button
            key={c.key}
            onClick={() => press(i)}
            style={{
              width: "9rem",
              height: "9rem",
              borderRadius: "1rem",
              background: c.hex,
              boxShadow:
                i === activeIdx
                  ? `0 0 30px 8px ${c.hex}`
                  : "0 8px 20px rgba(0,0,0,0.35)",
              outline: "none",
              border: "0",
              transform: i === activeIdx ? "scale(1.03)" : "scale(1)",
              transition: "transform 120ms ease, box-shadow 120ms ease",
              cursor: "pointer",
            }}
            aria-label={`Pad ${c.key}`}
          />
        ))}
      </div>

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
          minWidth: 260,
        }}
      >
        <div style={{ fontWeight: 600 }}>Simon Says</div>
        <div>Repeat the flashing color sequence. Round {round}</div>
        {error && (
          <div style={{ color: "#b91c1c", marginTop: 4 }}>
            Oops — restarting the round.
          </div>
        )}
        {complete && (
          <div style={{ color: "#166534", marginTop: 4 }}>Unlocked!</div>
        )}
        <button
          onClick={restart}
          style={{
            marginTop: 6,
            fontSize: 12,
            background: "#111",
            color: "white",
            border: 0,
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Restart
        </button>
      </div>
    </div>
  );
}
