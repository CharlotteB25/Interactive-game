// environment/Lights.jsx
import React, { useMemo } from "react";
import { Environment } from "@react-three/drei";
import { userSettings } from "../stores/userSettings"; // <-- JS store from earlier

export default function Lights({ theme: themeProp }) {
  // Use global theme, but allow a prop override
  const storeTheme = userSettings((s) => s.theme);
  const theme = themeProp || storeTheme || "dark";
  const isDark = theme === "dark";

  // Tweak all lighting from one place
  const params = useMemo(
    () => ({
      dirColor: isDark ? "#a8c7ff" : "#fff3d1",
      dirIntensity: isDark ? 1.4 : 0.9,
      ambientIntensity: isDark ? 0.35 : 0.6,
      envPreset: isDark ? "night" : "sunset", // other nice options: "city", "studio"
      envIntensity: isDark ? 0.9 : 1.2,
    }),
    [isDark]
  );

  return (
    <>
      {/* Key light */}
      <directionalLight
        castShadow
        position={[0, 6, 2]}
        intensity={params.dirIntensity}
        color={params.dirColor}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* Fill */}
      <ambientLight intensity={params.ambientIntensity} />

      {/* Image-based lighting + background */}
      <Environment
        preset={params.envPreset}
        background
        intensity={params.envIntensity}
      />
    </>
  );
}
