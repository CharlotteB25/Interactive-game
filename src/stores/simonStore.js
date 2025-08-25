// stores/simonStore.js
import { create } from "zustand";

export const useSimonStore = create((set, get) => {
  // helper: fire a DOM event so HUD can play SFX
  const emitFeedback = (type) => {
    try {
      window.dispatchEvent(new CustomEvent("simon-feedback", { detail: type }));
    } catch {}
  };

  return {
    // Game state
    stage: "intro", // "intro" | "playing" | "fail" | "done"
    round: 1,
    length: 3,
    maxLength: 5,
    sequence: [],
    revealing: false,
    waiting: false, // ← gates input during reveals/delays
    activeIdx: -1,
    inputIdx: 0,
    complete: false,
    error: false,
    nearIndex: -1,

    // Mutators
    setNearIndex: (idx) => set({ nearIndex: idx }),
    setActiveIdx: (i) => set({ activeIdx: i }),

    // called by beacons when reveal is finished
    endReveal: () => set({ activeIdx: -1, revealing: false, waiting: false }),

    start: () => {
      const L = get().length;
      const seq = Array.from({ length: L }, () =>
        Math.floor(Math.random() * 4)
      );
      set({
        error: false,
        sequence: seq,
        inputIdx: 0,
        revealing: true, // beacons will animate the reveal
        waiting: true, // block input until endReveal()
        activeIdx: -1,
        stage: "playing",
        complete: false,
        round: 1,
      });
      // optional: emitFeedback("start");
    },

    replay: () => {
      if (!get().sequence.length) return;
      set({
        error: false,
        inputIdx: 0,
        revealing: true,
        waiting: true, // block input until reveal finishes
        activeIdx: -1,
        stage: "playing",
      });
      // optional: emitFeedback("round"); // if you want a small cue on replay
    },

    press: (idx) => {
      const {
        stage,
        revealing,
        waiting,
        complete,
        sequence,
        inputIdx,
        length,
        maxLength,
        round,
      } = get();

      // ignore input outside of active play
      if (stage !== "playing" || revealing || waiting || complete) return;

      const correct = sequence[inputIdx] === idx;

      if (correct) {
        emitFeedback("correct");

        // finished the current sequence?
        if (inputIdx + 1 === sequence.length) {
          if (length >= maxLength) {
            // game complete
            set({ complete: true, stage: "done" });
            emitFeedback("complete");
          } else {
            // next round: increase length and generate a fresh sequence
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
              waiting: true, // wait for the next reveal
              error: false,
            });
            emitFeedback("round");
          }
        } else {
          // still within the current round
          set({ inputIdx: inputIdx + 1 });
        }
      } else {
        // wrong input: flag fail; HUD can offer Replay
        set({
          error: true,
          inputIdx: 0,
          revealing: false,
          waiting: false,
          stage: "fail",
        });
        emitFeedback("wrong");
      }
    },

    resetAll: () =>
      set({
        stage: "intro",
        round: 1,
        length: 3,
        sequence: [],
        revealing: false,
        waiting: false,
        activeIdx: -1,
        inputIdx: 0,
        complete: false,
        error: false,
        nearIndex: -1,
      }),
  };
});
