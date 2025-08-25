import { create } from "zustand";

/**
 * @typedef {"start" | "experience" | "end"} Stage
 * @typedef {"dark" | "light"} Theme
 * @typedef {"none" | "backgroundMusic.wav" | "backgroundMusicNature.wav" | "backgroundMusicPiano.mp3" | "backgroundMusicUpbeat.m4a"} Music
 */

/**
 * @typedef {Object} XRSettings
 * @property {string} name
 * @property {Theme} theme
 * @property {Music} music
 * @property {Stage} stage
 * @property {(n: string) => void} setName
 * @property {(t: Theme) => void} setTheme
 * @property {(m: Music) => void} setMusic
 * @property {(s: Stage) => void} setStage
 */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<XRSettings>>} */
export const userSettings = create((set) => ({
  name: "",
  theme: "dark",
  music: "none",
  stage: "start",
  setName: (name) => set({ name }),
  setTheme: (theme) => set({ theme }),
  setMusic: (music) => set({ music }),
  setStage: (stage) => set({ stage }),
}));
