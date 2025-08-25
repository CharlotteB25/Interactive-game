// GameFlow.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const GameFlowContext = createContext(null);

export function GameFlowProvider({ children }) {
  // Simon gate → riddle
  const [simonComplete, setSimonComplete] = useState(false);
  const [riddleSolved, setRiddleSolved] = useState(false);

  const value = useMemo(
    () => ({
      // current API
      simonComplete,
      setSimonComplete,
      riddleSolved,
      setRiddleSolved,

      // backwards-compat aliases (your old names)
      firefliesCleared: simonComplete,
      setFirefliesCleared: setSimonComplete,

      // small helpers if you need them
      resetSimon: () => setSimonComplete(false),
      resetRiddle: () => setRiddleSolved(false),
    }),
    [simonComplete, riddleSolved]
  );

  return (
    <GameFlowContext.Provider value={value}>
      {children}
    </GameFlowContext.Provider>
  );
}

export function useGameFlow() {
  const ctx = useContext(GameFlowContext);
  if (!ctx) throw new Error("useGameFlow must be used inside GameFlowProvider");
  return ctx;
}
