import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import * as THREE from "three";

const SPEED = 2;

const keys = {
  forward: ["s", "ArrowUp"],
  backward: ["w", "ArrowDown"],
  left: ["d", "ArrowLeft"],
  right: ["a", "ArrowRight"],
};
// Player component for controlling movement in the scene, keyboard input handling, and camera following. Don't know why this is reversed instead of normal wasd

export default function Player() {
  const { camera } = useThree();
  const playerRef = useRef();
  const move = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const direction = new THREE.Vector3();
  const velocity = new THREE.Vector3();

  const handleKey = (key, pressed) => {
    Object.entries(keys).forEach(([dir, keyList]) => {
      if (keyList.includes(key.toLowerCase())) {
        move.current[dir] = pressed;
      }
    });
  };

  useEffect(() => {
    const onKeyDown = (e) => handleKey(e.key, true);
    const onKeyUp = (e) => handleKey(e.key, false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!playerRef.current) return;

    // Determine movement direction
    direction.set(0, 0, 0);
    if (move.current.forward) direction.z -= 1;
    if (move.current.backward) direction.z += 1;
    if (move.current.left) direction.x -= 1;
    if (move.current.right) direction.x += 1;

    direction.normalize();

    // Convert movement direction relative to camera angle
    const angle = camera.rotation.y;
    const moveX = direction.x * Math.cos(angle) - direction.z * Math.sin(angle);
    const moveZ = direction.x * Math.sin(angle) + direction.z * Math.cos(angle);

    velocity.set(moveX, 0, moveZ).multiplyScalar(SPEED);
    playerRef.current.setLinvel(velocity, true);

    // Follow player with camera
    const pos = playerRef.current.translation();
    camera.position.set(pos.x, pos.y + 1.5, pos.z);
  });

  return (
    <>
      <PointerLockControls />
      <RigidBody
        ref={playerRef}
        colliders={false}
        position={[0, 1, 0]}
        enabledRotations={[false, false, false]}
        linearDamping={0.9}
        type="dynamic"
      >
        <CylinderCollider args={[0.5, 1, 0.5]} />
      </RigidBody>
    </>
  );
}
