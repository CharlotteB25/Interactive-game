import { useGLTF } from "@react-three/drei";
import React from "react";
import coffeeModel from "./coffee.glb";

const Coffee = ({ ...props }) => {
  const model = useGLTF(coffeeModel);

  return <primitive object={model.scene} {...props} />;
};

export default Coffee;
