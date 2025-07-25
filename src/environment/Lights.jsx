import React from "react";
import { useControls } from "leva";
import { Sky } from "@react-three/drei";
import { Environment } from "@react-three/drei";

const Lights = () => {
  return (
    <>
      <directionalLight
        castShadow
        position={[0, 5, 2]}
        intensity={6}
        color="#666666"
      />
      <ambientLight intensity={0.5} />

      <Environment preset="night" background />
    </>
  );
};

export default Lights;
