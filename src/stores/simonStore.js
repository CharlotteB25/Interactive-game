import { create } from "zustand";

export const useSimonStore = create((set, get) => ({
  // Game state
  stage: "intro", // "intro" | "playing" | "fail" | "done"
  round: 1,
  length: 3,
  maxLength: 5,
  sequence: [],
  revealing: false,
  activeIdx: -1,
  inputIdx: 0,
  complete: false,
  error: false,
  nearIndex: -1,

  // Mutators
  setNearIndex: (idx) => set({ nearIndex: idx }),
  setActiveIdx: (i) => set({ activeIdx: i }),
  endReveal: () => set({ activeIdx: -1, revealing: false }),

  start: () => {
    const L = get().length;
    const seq = Array.from({ length: L }, () => Math.floor(Math.random() * 4));
    set({
      error: false,
      sequence: seq,
      inputIdx: 0,
      revealing: true,
      activeIdx: -1,
      stage: "playing",
      complete: false,
    });
  },

  replay: () => {
    if (!get().sequence.length) return;
    set({
      error: false,
      inputIdx: 0,
      revealing: true,
      activeIdx: -1,
      stage: "playing",
    });
  },

  press: (idx) => {
    const {
      revealing,
      complete,
      sequence,
      inputIdx,
      length,
      maxLength,
      round,
    } = get();
    if (revealing || complete) return;

    if (sequence[inputIdx] === idx) {
      if (inputIdx + 1 === sequence.length) {
        if (length >= maxLength) {
          set({ complete: true, stage: "done" });
        } else {
          const nextLen = length + 1;
          const nextSeq = Array.from({ length: nextLen }, () =>
            Math.floor(Math.random() * 4)
          );
          set({
            length: nextLen,
            round: round + 1,
            sequence: nextSeq,
            inputIdx: 0,
            revealing: true,
            error: false,
          });
        }
      } else {
        set({ inputIdx: inputIdx + 1 });
      }
    } else {
      set({ error: true, inputIdx: 0, revealing: false, stage: "fail" });
    }
  },

  resetAll: () =>
    set({
      stage: "intro",
      round: 1,
      length: 3,
      sequence: [],
      revealing: false,
      activeIdx: -1,
      inputIdx: 0,
      complete: false,
      error: false,
      nearIndex: -1,
    }),
}));
