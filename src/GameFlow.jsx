import React, { createContext, useContext, useState } from "react";

const GameFlowContext = createContext(null);

export function GameFlowProvider({ children }) {
  const [riddleSolved, setRiddleSolved] = useState(false);

  // ⬇️ NEW: gate “Forest of Facts” behind the firefly game
  const [firefliesCleared, setFirefliesCleared] = useState(false);

  return (
    <GameFlowContext.Provider
      value={{
        riddleSolved,
        setRiddleSolved,
        firefliesCleared,
        setFirefliesCleared,
      }}
    >
      {children}
    </GameFlowContext.Provider>
  );
}

export function useGameFlow() {
  const ctx = useContext(GameFlowContext);
  if (!ctx) throw new Error("useGameFlow must be used inside GameFlowProvider");
  return ctx;
}
