import { OrbitControls, Environment } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { Physics, CuboidCollider } from "@react-three/rapier";
import { EffectComposer, Bloom } from "@react-three/postprocessing"; // ✅ Import bloom

import Lights from "./environment/Lights";
import Floor from "./components/Floor/Floor";
import Coffee from "./components/Coffee/Coffee";
import Building from "./components/Building/Building";
import BuildingColliders from "./components/Building/BuildingColliders";
import Player from "./Player";
import RiddleTerminal from "./components/RiddleTerminal";
import Clue from "./components/Clue"; // ✅ Clues with glow
import DeskColliders from "./components/Building/DeskColliders"; // ✅ Desk colliders

export default function Experience() {
  return (
    <>
      <Perf position="top-left" />
      {/* <OrbitControls makeDefault /> */}

      <Lights />

      <Physics debug gravity={[0, -9.81, 0]}>
        <RiddleTerminal
          position={[0, 1, 0]}
          onSolved={() => {
            console.log("Riddle solved!");
          }}
        />
        <Player />
        <Building position={[0, 0, 0]} />
        <Building
          mirror
          position={[0.7, 0, 15]}
          rotation={[0, Math.PI + 0.1, 0]}
        />
        <BuildingColliders position={[0, 0, 0]} />
        <DeskColliders position={[0, 0, 0]} />
        {/* Glowing Clues */}
        <Clue
          position={[-2, 0.5, 11.5]}
          message="The answer lies near the roots."
          onClueFound={() => console.log("Clue 1 found!")}
        />
        <Clue
          position={[2, 0.5, 13]}
          message="A tree holds more than leaves."
          onClueFound={() => console.log("Clue 2 found!")}
        />
        <Clue
          position={[4.5, 0.5, 4]}
          message="Seek the whisper in silence."
          onClueFound={() => console.log("Clue 3 found!")}
        />
        <Clue
          position={[-2, 0.5, 7]}
          message="Truth is often mirrored."
          onClueFound={() => console.log("Clue 4 found!")}
        />
        {/* Ground collider */}
        {/*         <CuboidCollider args={[50, 1, 50]} position={[0, -1, 0]} />
         */}
      </Physics>

      {/* 🌟 Post-processing bloom effect */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.1}
        />
      </EffectComposer>
    </>
  );
}
