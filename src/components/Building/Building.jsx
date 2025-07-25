import { useGLTF, useTexture } from "@react-three/drei";
import React, { useMemo } from "react";
import * as THREE from "three";
import buildingModel from "./old_fantasy-style_library.glb";

// ✅ Adjust this path to match the actual image filename
import woodColor from "../../assets/textures/wood/woodTexture.jpg";

const BuildingModel = React.forwardRef(({ mirror = false, ...props }, ref) => {
  const { scene } = useGLTF(buildingModel);
  const cloned = useMemo(
    () => (mirror ? scene.clone() : scene),
    [scene, mirror]
  );

  // ✅ Load and configure wood texture
  const texture = useTexture(woodColor);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4); // More repeat = smaller pattern

  return (
    <group {...props}>
      <primitive
        object={cloned}
        ref={ref}
        scale={mirror ? [-0.01, 0.01, 0.01] : [0.01, 0.01, 0.01]}
      />

      {/* Ceiling / Roof with realistic wood texture */}
      <mesh position={[0, 10, 0]}>
        <boxGeometry args={[25, 1, 25]} />
        <meshStandardMaterial
          map={texture}
          roughness={1}
          metalness={0}
          color="#e8ad80"
        />
      </mesh>
    </group>
  );
});

export default BuildingModel;
