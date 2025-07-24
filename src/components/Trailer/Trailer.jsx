import { useGLTF } from "@react-three/drei";
import React from "react";
import trailerModel from "./trailer.glb";

const Trailer = ({...props}) => {
  const model = useGLTF(trailerModel);

  return (
    <primitive
      object={model.scene}
      {...props}
    />
  );
};

export default Trailer;