import StartOverlay from "./StartOverlay";
import EndOverlay from "./EndOverlay";
import MusicManager from "./MusicManager";
import { userSettings } from "./stores/userSettings";
import { useGameFlow } from "./GameFlow";
import { Perf } from "r3f-perf";
import Lights from "./environment/Lights";
import { Physics } from "@react-three/rapier";
import SimonBeacons from "./components/SimonBeacons/SimonBeacons";
import Player from "./Player";
import Building from "./components/Building/Building";
import BuildingColliders from "./components/Building/BuildingColliders";
import DeskColliders from "./components/Building/DeskColliders";
import Clue from "./components/Clue";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import RiddleTerminal from "./components/RiddleTerminal";

export default function Experience() {
  const { simonComplete, setSimonComplete, setRiddleSolved } = useGameFlow();
  const { stage, theme } = userSettings();

  return (
    <>
      <MusicManager />

      {/* Overlays */}
      {stage === "start" && <StartOverlay />}
      {stage === "end" && <EndOverlay />}

      {stage === "experience" && (
        <>
          <Perf position="top-left" />
          <Lights theme={theme} />

          <Physics debug gravity={[0, -9.81, 0]}>
            {!simonComplete && (
              <SimonBeacons onComplete={() => setSimonComplete(true)} />
            )}
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

            {simonComplete && (
              <>
                <Clue
                  position={[-2, 0.5, 11.5]}
                  message="The answer lies near the roots."
                />
                <Clue
                  position={[4.5, 0.5, 4]}
                  message="Seek the whisper in silence."
                />
                <Clue
                  position={[-2, 0.5, 7]}
                  message="Truth is often mirrored."
                />
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
      )}
    </>
  );
}
