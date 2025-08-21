import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

const GameFlowCtx = createContext(null);

export function GameFlowProvider({ children }) {
  const [simonComplete, setSimonComplete] = useState(false);
  const [riddleSolved, setRiddleSolved] = useState(false);

  const value = useMemo(
    () => ({
      simonComplete,
      setSimonComplete,
      riddleSolved,
      setRiddleSolved,
      resetAll: () => {
        setSimonComplete(false);
        setRiddleSolved(false);
      },
    }),
    [simonComplete, riddleSolved]
  );

  return <GameFlowCtx.Provider value={value}>{children}</GameFlowCtx.Provider>;
}

export function useGameFlow() {
  const ctx = useContext(GameFlowCtx);
  if (!ctx)
    throw new Error("useGameFlow must be used inside <GameFlowProvider>");
  return ctx;
}
