// src/components/ForestModels/<Name>/<Name>.jsx
import React, { useMemo } from "react";
import { useGLTF, Center } from "@react-three/drei";
import url from "./low_poly_plane.glb";

export default function Plane(props) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(), [scene]);
  return (
    <Center {...props}>
      <primitive object={clone} scale={0.15} position={[-5, 0, 10]} />
    </Center>
  );
}
useGLTF.preload(url);
