import React from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

export default function DeskColliders({ position = [0, 0, 0] }) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      {/* Left side desks */}
      <CuboidCollider args={[0.00005, 1, 0.00005]} position={[-2.05, 2, 2.5]} />
      <CuboidCollider args={[0.00005, 1, 0.00005]} position={[-2.25, 2, 6.5]} />
      <CuboidCollider args={[0.00005, 1, 0.00005]} position={[-2.25, 2, 9]} />
      <CuboidCollider
        args={[0.00005, 1, 0.00005]}
        position={[-1.75, 2, 13.5]}
      />

      {/* Right side desks (mirrored across X axis) */}
      <CuboidCollider args={[0.00005, 1, 0.00005]} position={[3.05, 2, 2]} />
      <CuboidCollider args={[0.00005, 1, 0.00005]} position={[2.75, 2, 6]} />
      <CuboidCollider args={[0.00005, 1, 0.00005]} position={[3, 2, 9]} />
      <CuboidCollider args={[0.00005, 1, 0.00005]} position={[3, 2, 13]} />

      {/* Debug visuals – left */}
      <mesh position={[-2.05, 0, 2.5]}>
        <boxGeometry args={[0.05, 2, 0.05]} />
        <meshStandardMaterial color="red" transparent opacity={0.2} />
      </mesh>
      <mesh position={[-2.25, 0, 6.5]}>
        <boxGeometry args={[0.05, 2, 0.05]} />
        <meshStandardMaterial color="blue" transparent opacity={0.2} />
      </mesh>
      <mesh position={[-2.25, 0, 9]}>
        <boxGeometry args={[0.05, 2, 0.05]} />
        <meshStandardMaterial color="orange" transparent opacity={0.2} />
      </mesh>
      <mesh position={[-1.75, 0, 13.5]}>
        <boxGeometry args={[0.05, 2, 0.05]} />
        <meshStandardMaterial color="purple" transparent opacity={0.2} />
      </mesh>

      {/* Debug visuals – right */}
      <mesh position={[3.05, 0, 2]}>
        <boxGeometry args={[0.05, 2, 0.05]} />
        <meshStandardMaterial color="red" transparent opacity={0.2} />
      </mesh>
      <mesh position={[2.75, 0, 6]}>
        <boxGeometry args={[0.05, 2, 0.05]} />
        <meshStandardMaterial color="blue" transparent opacity={0.2} />
      </mesh>
      <mesh position={[3, 0, 9]}>
        <boxGeometry args={[0.05, 2, 0.05]} />
        <meshStandardMaterial color="orange" transparent opacity={0.2} />
      </mesh>
      <mesh position={[3, 0, 13]}>
        <boxGeometry args={[0.05, 2, 0.05]} />
        <meshStandardMaterial color="purple" transparent opacity={0.2} />
      </mesh>
    </RigidBody>
  );
}
