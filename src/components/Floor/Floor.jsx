import React from "react";

const Floor = ({ ...props }) => {
  return (
    <mesh {...props}>
      <boxGeometry args={[10, 0.5, 10]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
};

export default Floor;
