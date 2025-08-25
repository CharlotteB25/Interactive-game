import React, { useMemo } from "react";
import { useGLTF, Center } from "@react-three/drei";
import booksUrl from "./11_books_householdpropschallenge.glb"; // <- GLB next to this file

export default function Books(props) {
  const { scene } = useGLTF(booksUrl);
  // Clone so multiple instances don’t mutate the same scene graph
  const clone = useMemo(() => scene.clone(), [scene]);

  return (
    <Center /* auto-center and scale bounds if you want: disableScale*/
      {...props}
    >
      <primitive
        object={clone}
        scale={1.5}
        position={[0, 0, 0]}
        rotation={[0, 8, 0]}
      />
    </Center>
  );
}
useGLTF.preload(booksUrl);
