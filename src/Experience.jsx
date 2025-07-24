import { OrbitControls, Environment } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { Physics, CuboidCollider } from "@react-three/rapier";

import Lights from "./environment/Lights";
import Floor from "./components/Floor/Floor";
import Coffee from "./components/Coffee/Coffee";
import Building from "./components/Building/Building";
import BuildingColliders from "./components/Building/BuildingColliders";
import Player from "./Player";
import RiddleTerminal from "./components/RiddleTerminal";

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

        {/* Player needs Physics context to function */}
        <Player />

        {/* Building and mirrored version */}
        <Building position={[0, 0, 0]} />
        <Building
          mirror
          position={[0.7, 0, 15]}
          rotation={[0, Math.PI + 0.1, 0]}
        />
        {/* One shared collider setup for both rooms */}
        <BuildingColliders position={[0, 0, 0]} />

        {/* Ground collider so player doesn't fall */}
        <CuboidCollider args={[50, 1, 50]} position={[0, -1, 0]} />
      </Physics>
    </>
  );
}
