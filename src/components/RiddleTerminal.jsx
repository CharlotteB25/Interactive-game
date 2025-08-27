import React, { useState, useRef, useMemo, useEffect } from "react";
import { Html } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { userSettings } from "../stores/userSettings";

const correctAnswer = "knowledge";

// Minimalist palette (same vibe as your other overlays)
function usePalette(theme = "system") {
  const [sysDark, setSysDark] = useState(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
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
      panel: dark ? "rgba(17,17,18,0.90)" : "rgba(248,248,249,0.90)",
      text: dark ? "#e6e7e9" : "#0b0d12",
      subtext: dark ? "rgba(230,231,233,0.70)" : "rgba(11,13,18,0.65)",
      hairline: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      shadow: dark
        ? "0 8px 24px rgba(0,0,0,0.35)"
        : "0 8px 24px rgba(0,0,0,0.10)",
      accent,
      accentSubtle: dark ? "rgba(158,206,181,0.16)" : "rgba(37,99,235,0.10)",
      warn: dark ? "#f18f8f" : "#b91c1c",
      font: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans"',
    };
  }, [dark]);
}

export default function RiddleTerminal({ onSolved, position = [0, 1, 0] }) {
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isGood, setIsGood] = useState(null); // null | true | false
  const inputRef = useRef();

  const { theme, name } = userSettings(); // pull theme + name for personalization
  const palette = usePalette(theme);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = userInput.trim().toLowerCase() === correctAnswer;
    setIsGood(ok);
    if (ok) {
      setFeedback("Access granted — unlocking…");
      onSolved?.();
    } else {
      setFeedback("Access denied — try again.");
    }
  };

  const panelBase = {
    background: palette.panel,
    color: palette.text,
    padding: "16px 18px",
    width: 280,
    height: 130,
    borderRadius: 12,
    boxShadow: palette.shadow,
    backdropFilter: "blur(6px)",
    fontFamily: palette.font,
    textAlign: "left",
    border: `1px solid ${palette.hairline}`,
  };

  const titleRow = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    color: palette.accent,
    fontWeight: 600,
    letterSpacing: 0.3,
    fontSize: 14,
    textTransform: "none",
  };

  const inputStyle = {
    width: "90%",
    padding: "10px 12px",
    borderRadius: 8,
    background: palette.dark ? "rgba(2,6,23,0.6)" : "rgba(241,245,249,0.8)",
    color: palette.text,
    border:
      isGood === null
        ? `1px solid ${palette.hairline}`
        : isGood
        ? `1px solid ${palette.accent}`
        : `1px solid ${palette.warn}`,
    outline: "none",
    fontFamily: palette.font,
    fontSize: 13,
    transition: "box-shadow 160ms ease, border-color 160ms ease",
    boxShadow:
      isGood === null
        ? "none"
        : isGood
        ? "0 0 18px rgba(37,99,235,0.15)"
        : "0 0 18px rgba(185,28,28,0.18)",
  };

  const hint = {
    margin: "6px 0 10px 0",
    lineHeight: 1.35,
    fontSize: 14,
    color: palette.subtext,
  };

  const feedbackStyle = {
    marginTop: 8,
    fontSize: 12,
    color:
      isGood === null
        ? palette.subtext
        : isGood
        ? palette.accent
        : palette.warn,
    minHeight: 18,
  };

  return (
    <RigidBody type="fixed" position={position}>
      <Html position={[-0.5, 1.5, 0]}>
        <div style={panelBase}>
          {/* Title */}
          <div style={titleRow}>
            <span>Riddle Terminal{name ? ` — ${name}` : ""}</span>
            <span
              aria-hidden
              style={{
                width: 8,
                height: 14,
                background: palette.accent,
                display: "inline-block",
                animation: "blink 1.2s steps(1,end) infinite",
              }}
            />
          </div>

          {/* Question */}
          <p style={hint}>
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
              placeholder="Type answer and press Enter"
              autoComplete="off"
              spellCheck={false}
              style={inputStyle}
              onFocus={(e) => {
                if (isGood === null) {
                  e.currentTarget.style.boxShadow = "0 0 18px rgba(0,0,0,0.08)";
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
          <p style={feedbackStyle}>{feedback}</p>

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
