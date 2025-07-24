import { useGLTF } from "@react-three/drei";
import React, { useMemo } from "react";
import buildingModel from "./old_fantasy-style_library.glb";

const BuildingModel = React.forwardRef(({ mirror = false, ...props }, ref) => {
  const { scene } = useGLTF(buildingModel);

  const cloned = useMemo(
    () => (mirror ? scene.clone() : scene),
    [scene, mirror]
  );

  return (
    <primitive
      object={cloned}
      ref={ref}
      scale={mirror ? [-0.01, 0.01, 0.01] : [0.01, 0.01, 0.01]}
      {...props}
    />
  );
});

export default BuildingModel;
