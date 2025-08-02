import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import * as THREE from "three";

import footstepSound from "./assets/sounds/footsteps.ogg";
import bgMusic from "./assets/sounds/backgroundMusic.wav";

const SPEED = 2;

export default function Player() {
  const { camera, gl } = useThree();
  const playerRef = useRef();

  const keysPressed = useRef({ w: false, a: false, s: false, d: false });
  const isWalking = useRef(false);

  // Footstep sound while player moves
  const footstepAudio = useRef(new Audio(footstepSound));
  footstepAudio.current.loop = true;
  footstepAudio.current.volume = 0.3;
  footstepAudio.current.playbackRate = 1.2;

  // Cozy Background music
  const musicRef = useRef(new Audio(bgMusic));
  const hasStartedMusic = useRef(false);

  musicRef.current.loop = true;
  musicRef.current.volume = 0.4;

  // Handle key presses - movement controls
  const handleKey = (key, pressed) => {
    const lowercase = key.toLowerCase();
    if (["w", "a", "s", "d"].includes(lowercase)) {
      keysPressed.current[lowercase] = pressed;
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

  // ✅ Play music once PointerLock is activated
  useEffect(() => {
    const handleClick = () => {
      if (!hasStartedMusic.current) {
        musicRef.current
          .play()
          .then(() => {
            hasStartedMusic.current = true;
            console.log("Background music started");
          })
          .catch((e) => {
            console.warn("Autoplay blocked", e);
          });
      }
    };
    // Add click listener to the canvas
    // This ensures the music starts only after user interaction
    // needed to add this for autoplay policies in browsers
    const dom = gl.domElement;
    dom.addEventListener("click", handleClick);
    return () => dom.removeEventListener("click", handleClick);
  }, [gl]);

  // Pointer lock controls - camera movement - adjusts camera position based on player movement. So forward is always forward relative to the camera.
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
      if (!isWalking.current) {
        footstepAudio.current.play();
        isWalking.current = true;
      }

      if (keysPressed.current.w) direction.add(forward);
      if (keysPressed.current.s) direction.sub(forward);
      if (keysPressed.current.a) direction.add(side);
      if (keysPressed.current.d) direction.sub(side);

      direction.normalize().multiplyScalar(SPEED);
      playerRef.current.setLinvel(direction, true);
    } else {
      if (isWalking.current) {
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
        position={[1, 0, 7]}
        enabledRotations={[false, false, false]}
        linearDamping={0.9}
        type="dynamic"
      >
        <CylinderCollider args={[0.4, 2, 0.4]} />
      </RigidBody>
    </>
  );
}
