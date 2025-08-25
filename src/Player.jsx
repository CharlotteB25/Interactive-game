// Player.jsx
import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import * as THREE from "three";

import footstepSound from "./assets/sounds/footsteps.ogg";

const SPEED = 2;

export default function Player({ start = [1, 0, 7] }) {
  const { camera } = useThree();
  const playerRef = useRef();

  const keysPressed = useRef({ w: false, a: false, s: false, d: false });
  const isWalking = useRef(false);

  // Footsteps (looped while moving)
  const footstepAudio = useRef(null);
  useEffect(() => {
    const a = new Audio(footstepSound);
    a.loop = true;
    a.volume = 0.3;
    a.playbackRate = 1.2;
    footstepAudio.current = a;

    return () => {
      a.pause();
      a.currentTime = 0;
      footstepAudio.current = null;
    };
  }, []);

  // Keyboard movement
  const handleKey = (key, pressed) => {
    const k = key.toLowerCase();
    if (k === "w" || k === "a" || k === "s" || k === "d") {
      keysPressed.current[k] = pressed;
    }
  };

  useEffect(() => {
    const down = (e) => handleKey(e.key, true);
    const up = (e) => handleKey(e.key, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Movement + camera follow
  useFrame(() => {
    if (!playerRef.current) return;

    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const side = new THREE.Vector3();

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    side.crossVectors(camera.up, forward).normalize();

    const isMoving =
      keysPressed.current.w ||
      keysPressed.current.a ||
      keysPressed.current.s ||
      keysPressed.current.d;

    if (isMoving) {
      if (!isWalking.current && footstepAudio.current) {
        // By this time the user has clicked (pointer lock), so playback is allowed
        footstepAudio.current.play().catch(() => {});
        isWalking.current = true;
      }

      if (keysPressed.current.w) direction.add(forward);
      if (keysPressed.current.s) direction.sub(forward);
      if (keysPressed.current.a) direction.add(side);
      if (keysPressed.current.d) direction.sub(side);

      direction.normalize().multiplyScalar(SPEED);
      playerRef.current.setLinvel(direction, true);
    } else {
      if (isWalking.current && footstepAudio.current) {
        footstepAudio.current.pause();
        footstepAudio.current.currentTime = 0;
        isWalking.current = false;
      }
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    const pos = playerRef.current.translation();
    camera.position.set(pos.x, pos.y + 1.5, pos.z);
  });

  return (
    <>
      <PointerLockControls />
      <RigidBody
        ref={playerRef}
        colliders={false}
        position={start}
        enabledRotations={[false, false, false]}
        linearDamping={0.9}
        type="dynamic"
      >
        <CylinderCollider args={[0.4, 2, 0.4]} />
      </RigidBody>
    </>
  );
}
