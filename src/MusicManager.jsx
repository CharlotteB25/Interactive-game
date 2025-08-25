// MusicManager.jsx
import React, { useEffect, useRef } from "react";
import { userSettings } from "./stores/userSettings";
import { useSimonStore } from "./stores/simonStore";

// ✅ Import the files from src/assets/sounds so Vite resolves the URLs
import bgDefault from "./assets/sounds/backgroundMusic.wav";
import bgNature from "./assets/sounds/backgroundMusicNature.wav";
import bgPiano from "./assets/sounds/backgroundMusicPiano.mp3";
import bgUpbeat from "./assets/sounds/backgroundMusicUpbeat.m4a";

const srcMap = {
  none: "",
  // support keys…
  backgroundMusic: bgDefault,
  backgroundMusicNature: bgNature,
  backgroundMusicPiano: bgPiano,
  backgroundMusicUpbeat: bgUpbeat,
  // …and filenames (your radios currently use filenames)
  "backgroundMusic.wav": bgDefault,
  "backgroundMusicNature.wav": bgNature,
  "backgroundMusicPiano.mp3": bgPiano,
  "backgroundMusicUpbeat.m4a": bgUpbeat,
};

export default function MusicManager() {
  const music = userSettings((s) => s.music);
  const simonStage = useSimonStore((s) => s.stage);
  const audioRef = useRef(null);

  // Build/replace audio element when music selection changes
  useEffect(() => {
    const prev = audioRef.current;
    if (prev) {
      prev.pause();
      prev.currentTime = 0;
      audioRef.current = null;
    }
    if (!music || music === "none") return;

    // Resolve to imported URLs; final fallback tries /public/sounds if you later move files there
    const base = music.replace(/\.(wav|mp3|m4a)$/i, "");
    const src = srcMap[music] ?? srcMap[base] ?? `/sounds/${music}`;

    const a = new Audio(src);
    a.loop = true;
    a.volume = 0.4;
    audioRef.current = a;

    return () => {
      a.pause();
      a.currentTime = 0;
    };
  }, [music]);

  // Expose play/stop so StartOverlay can call during the click gesture
  useEffect(() => {
    userSettings.setState({
      _playMusicFromHUD: () => {
        const a = audioRef.current;
        if (!a) return Promise.resolve();
        return a.play().catch((err) => {
          console.warn("[Music] play() blocked/failed", err);
        });
      },
      _stopMusicFromHUD: () => {
        const a = audioRef.current;
        if (!a) return;
        a.pause();
        a.currentTime = 0;
      },
    });
    return () => {
      userSettings.setState({
        _playMusicFromHUD: undefined,
        _stopMusicFromHUD: undefined,
      });
    };
  }, []);

  // Optional: stop if Simon returns to intro
  useEffect(() => {
    if (simonStage === "intro" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [simonStage]);

  return null;
}
