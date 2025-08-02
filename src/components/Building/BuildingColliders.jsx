import React from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

export default function BuildingColliders({ position = [0, 0, 0] }) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      {/* Actual colliders */}
      <CuboidCollider args={[12, 1, 35]} position={[0, -0.5, 0]} />
      <CuboidCollider args={[12, 10, 5]} position={[0, 5, 24]} />
      <CuboidCollider args={[5, 10, 10]} position={[0, 5, -14]} />
      <CuboidCollider args={[1, 10, 30]} position={[-7.5, 5, 0]} />
      <CuboidCollider args={[1, 10, 30]} position={[8, 5, 0]} />

      {/* Debug visuals (so I can tell which collider is which 😍) */}
      {/* <mesh position={[0, 0, 0]}>
        <boxGeometry args={[12, 1, 35]} />
        <meshStandardMaterial color="green" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 5, 25]}>
        <boxGeometry args={[12, 10, 5]} />
        <meshStandardMaterial color="red" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 5, -12]}>
        <boxGeometry args={[5, 10, 1]} />
        <meshStandardMaterial color="blue" transparent opacity={0.2} />
      </mesh>
      <mesh position={[-7, 5, 0]}>
        <boxGeometry args={[1, 10, 30]} />
        <meshStandardMaterial color="orange" transparent opacity={0.2} />
      </mesh>
      <mesh position={[7, 5, 0]}>
        <boxGeometry args={[1, 10, 30]} />
        <meshStandardMaterial color="purple" transparent opacity={0.2} />
      </mesh> */}
    </RigidBody>
  );
}
