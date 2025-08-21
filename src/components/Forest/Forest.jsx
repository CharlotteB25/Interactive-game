// components/Forest/Forest.jsx
import React, { useMemo, useEffect, forwardRef } from "react";
import { useGLTF } from "@react-three/drei";
import forestModelUrl from "./pine_forest.glb";

const Forest = forwardRef(function Forest(
  {
    scale = 1, // tweak if your GLB is very large/small
    castShadows = true,
    receiveShadows = true,
    envMapIntensity = 0.6, // reduce if trees look too shiny
    ...props
  },
  ref
) {
  const { scene } = useGLTF(forestModelUrl);

  // Clone so multiple instances don’t mutate the same scene graph
  const root = useMemo(() => scene.clone(true), [scene]);

  // One-time setup for meshes/materials
  useEffect(() => {
    root.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = !!castShadows;
        obj.receiveShadow = !!receiveShadows;

        const m = obj.material;
        if (m && "envMapIntensity" in m) {
          m.envMapIntensity = envMapIntensity;
          m.needsUpdate = true;
        }

        // Large environments sometimes pop due to frustum culling
        obj.frustumCulled = false;
      }
    });
  }, [root, castShadows, receiveShadows, envMapIntensity]);

  return (
    <group {...props}>
      <primitive ref={ref} object={root} scale={scale} />
    </group>
  );
});

export default Forest;

// Preload the GLB to avoid a hitch when first shown
useGLTF.preload(forestModelUrl);
