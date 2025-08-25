// src/components/ForestModels/<Name>/<Name>.jsx
import React, { useMemo } from "react";
import { useGLTF, Center } from "@react-three/drei";
import url from "./acoustic_guitar.glb";

export default function Guitar(props) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(), [scene]);
  return (
    <Center {...props}>
      <primitive
        object={clone}
        scale={1.5}
        position={[-4, 0, -4]}
        rotation={[2, 0, 5]}
      />
    </Center>
  );
}
useGLTF.preload(url);
