// App.jsx
import { Fragment, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Experience from "./Experience.jsx"; // room scene (no Canvas)
import ForestScene from "./ForestScene.jsx"; // forest scene (no Canvas)

import SimonBeacons from "./components/SimonBeacons/SimonBeacons.jsx";
import SimonHUD from "./components/SimonHUD.jsx";

import { GameFlowProvider, useGameFlow } from "./GameFlow.jsx";

function GateToForest() {
  const { riddleSolved } = useGameFlow();
  const navigate = useNavigate();
  useEffect(() => {
    if (riddleSolved) navigate("/forest");
  }, [riddleSolved, navigate]);
  return null;
}

// Switch what renders INSIDE the single Canvas based on route
function SceneSwitch() {
  const { pathname } = useLocation();
  if (pathname === "/forest") return <ForestScene />;
  // default = the room scene + beacons
  return (
    <>
      <Experience />
    </>
  );
}

// Switch HUD (pure DOM) NEXT TO the Canvas
function HUDSwitch() {
  const { pathname } = useLocation();
  if (pathname === "/forest") {
    return (
      <div
        style={{
          pointerEvents: "none",
        }}
      ></div>
    );
  }
  return <SimonHUD />;
}

function AppInner() {
  return (
    <Fragment>
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        <Canvas
          dpr={[1, 1.25]}
          onCreated={({ scene }) => {
            scene.background = null; // make sure Drei can set it
            scene.environment = null;
          }}
          shadows={false}
          camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, -25] }}
        >
          <SceneSwitch />
        </Canvas>

        <HUDSwitch />
      </div>

      {/* Keep routes so the URL changes, but we render scenes via SceneSwitch */}
      <Routes>
        <Route path="/" element={<Fragment />} />
        <Route path="/forest" element={<Fragment />} />
      </Routes>
    </Fragment>
  );
}

export default function App() {
  return (
    <GameFlowProvider>
      <BrowserRouter>
        <GateToForest />
        <AppInner />
      </BrowserRouter>
    </GameFlowProvider>
  );
}
