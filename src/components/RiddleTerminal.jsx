import React, { useState, useRef } from "react";
import { Html } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

const correctAnswer = "knowledge";

export default function RiddleTerminal({ onSolved, position = [0, 1, 0] }) {
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isGood, setIsGood] = useState(null); // null | true | false
  const inputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = userInput.trim().toLowerCase() === correctAnswer;
    setIsGood(ok);
    if (ok) {
      setFeedback("✅ ACCESS GRANTED — unlocking…");
      onSolved?.();
    } else {
      setFeedback("❌ ACCESS DENIED — try again.");
    }
  };

  return (
    <RigidBody type="fixed" position={position}>
      <Html position={[-0.5, 1.5, 0]}>
        <div
          style={{
            background: "rgba(0,0,0,0.85)",
            color: "#e2e8f0",
            padding: "16px 18px",
            width: 260,
            borderRadius: 10,
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            fontFamily: `"Courier New", monospace`,
            textAlign: "left",
            border: "1px solid rgba(148,163,184,0.2)",
          }}
        >
          {/* Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              color: "#10b981",
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: 14,
              textTransform: "uppercase",
            }}
          >
            <span>RIDDLE TERMINAL</span>
            <span
              aria-hidden
              style={{
                width: 8,
                height: 14,
                background: "#10b981",
                display: "inline-block",
                animation: "blink 1.2s steps(1,end) infinite",
              }}
            />
          </div>

          {/* Question */}
          <p style={{ margin: "6px 0 10px 0", lineHeight: 1.35 }}>
            What grows with sharing
            <br />
            but shrinks with silence?
          </p>

          {/* Input */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="> type answer and press Enter"
              autoComplete="off"
              spellCheck={false}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 6,
                background: "rgba(2,6,23,0.6)",
                color: "#f8fafc",
                border: `1px solid ${
                  isGood === null
                    ? "rgba(148,163,184,0.35)"
                    : isGood
                    ? "rgba(16,185,129,0.9)"
                    : "rgba(248,113,113,0.9)"
                }`,
                outline: "none",
                fontFamily: `"Courier New", monospace`,
                fontSize: 13,
                boxShadow:
                  isGood === null
                    ? "0 0 0 0 rgba(0,0,0,0)"
                    : isGood
                    ? "0 0 18px rgba(16,185,129,0.25)"
                    : "0 0 18px rgba(248,113,113,0.25)",
                transition: "box-shadow 160ms ease, border-color 160ms ease",
              }}
              onFocus={(e) => {
                if (isGood === null) {
                  e.currentTarget.style.boxShadow =
                    "0 0 18px rgba(148,163,184,0.25)";
                }
              }}
              onBlur={(e) => {
                if (isGood === null) {
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            />
          </form>

          {/* Feedback */}
          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              color:
                isGood === null ? "#cbd5e1" : isGood ? "#10b981" : "#f87171",
              minHeight: 18,
            }}
          >
            {feedback}
          </p>

          {/* Tiny scoped keyframes */}
          <style>
            {`
              @keyframes blink {
                0%, 49% { opacity: 1; }
                50%, 100% { opacity: 0; }
              }
            `}
          </style>
        </div>
      </Html>
    </RigidBody>
  );
}
