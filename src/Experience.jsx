import SimonBeacons from "./components/SimonBeacons/SimonBeacons";
import { useGameFlow } from "./GameFlow"; // or "./game/GameFlow" if that's your path
import { Perf } from "r3f-perf";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Player from "./Player";
import Lights from "./environment/Lights";
import { Physics } from "@react-three/rapier";
import Building from "./components/Building/Building";
import BuildingColliders from "./components/Building/BuildingColliders";
import DeskColliders from "./components/Building/DeskColliders";
import RiddleTerminal from "./components/RiddleTerminal";
import Clue from "./components/Clue";

export default function Experience() {
  const { simonComplete, setSimonComplete, setRiddleSolved } = useGameFlow();

  return (
    <>
      <Perf position="top-left" />
      <Lights />

      <Physics debug gravity={[0, -9.81, 0]}>
        {!simonComplete && (
          <SimonBeacons
            // tweak positions to match where you want the cluster in your room

            onComplete={() => setSimonComplete(true)}
          />
        )}

        {/* Riddle only AFTER Simon */}
        {simonComplete && (
          <RiddleTerminal
            position={[0, 1, 0]}
            onSolved={() => setRiddleSolved(true)}
          />
        )}

        <Player />
        <Building position={[0, 0, 0]} />
        <Building
          mirror
          position={[0.7, 0, 15]}
          rotation={[0, Math.PI + 0.1, 0]}
        />
        <BuildingColliders position={[0, 0, 0]} />
        <DeskColliders position={[0, 0, 0]} />

        {/* Clues only AFTER Simon */}
        {simonComplete && (
          <>
            <Clue
              position={[-2, 0.5, 11.5]}
              message="The answer lies near the roots."
            />
            <Clue
              position={[2, 0.5, 13]}
              message="A tree holds more than leaves."
            />
            <Clue
              position={[4.5, 0.5, 4]}
              message="Seek the whisper in silence."
            />
            <Clue position={[-2, 0.5, 7]} message="Truth is often mirrored." />
          </>
        )}
      </Physics>

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
