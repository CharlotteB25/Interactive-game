import React, { useMemo, useState, useEffect } from "react";
import FloatBio from "./FloatBio";
import { userSettings } from "../../stores/userSettings";

// Models
import Books from "../ForestModels/Books/Books";
import Computer from "../ForestModels/Computer/Computer";
import Guitar from "../ForestModels/Guitar/Guitar";
import Plane from "../ForestModels/Plane/Plane";

// Minimal palette (same vibe as Start/End/HUD)
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
      font: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans"',
    };
  }, [dark]);
}

export default function BiosCluster({
  bios = [
    {
      position: [0, 1.8, -2],
      title: "Hi, I'm Charlotte 👋",
      text:
        "Developer drawn to minimalistic, colourful, creative design. " +
        "I build calm, playful interfaces that feel thoughtful and intentional.",
      Model: Computer,
      modelScale: 0.9,
      modelRotation: [0, Math.PI * 0.15, 0],
    },
    {
      position: [3, 1.8, 1],
      title: "Third-Culture Roots",
      text:
        "I grew up as a third-culture kid — navigating places and perspectives. " +
        "It shaped my empathy, curiosity, and a love for continuous learning and change.",
      Model: Books,
      modelScale: 0.9,
      modelRotation: [0, -Math.PI * 0.1, 0],
    },
    {
      position: [-3, 1.8, 2.5],
      title: "Travel & Nature 🌿",
      text:
        "Happiest outdoors and on the move — exploring new places, hiking in nature, " +
        "and finding quiet moments with my dog. That’s where the best ideas arrive.",
      Model: Plane,
      modelScale: 1.1,
      modelRotation: [0, Math.PI * 0.25, 0],
    },
    {
      position: [6, 1.8, -1.5],
      title: "Cozy & Creative",
      text:
        "Introvert at heart: books, warm mugs, and small creative rituals. " +
        "I love tinkering with interactive ideas — and occasionally a little guitar.",
      Model: Guitar,
      modelScale: 1.0,
      modelRotation: [0, -Math.PI * 0.2, 0],
    },
  ],
}) {
  const { theme } = userSettings();
  const p = usePalette(theme);

  // Shared UI overrides passed to each FloatBio card
  const ui = {
    panel: {
      background: p.panel,
      color: p.text,
      borderRadius: 12,
      padding: "16px 18px",
      fontFamily: p.font,
      boxShadow: p.shadow,
      border: `1px solid ${p.hairline}`,
    },
    title: {
      fontWeight: 600,
      fontSize: 14,
      letterSpacing: 0.3,
      color: p.accent,
      marginBottom: 6,
    },
    text: {
      fontSize: 13,
      color: p.subtext,
      lineHeight: 1.5,
    },
  };

  return (
    <>
      {bios.map((b, i) => (
        <FloatBio
          key={i}
          position={b.position}
          title={b.title}
          text={b.text}
          Model={b.Model}
          modelScale={b.modelScale}
          modelRotation={b.modelRotation}
          modelOffset={b.modelOffset}
          ui={ui} // theme-aware styles
          theme={theme} // (optional) raw theme if FloatBio needs it
        />
      ))}
    </>
  );
}
