import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text, Billboard } from "@react-three/drei";
import cosyFont from "../assets/fonts/Sour_Gummy/SourGummy-VariableFont_wdth,wght.ttf";

export default function Clue({ position = [0, 0, 0], message, onClueFound }) {
  const meshRef = useRef();
  const playerPosRef = useRef(new THREE.Vector3());
  const [showText, setShowText] = useState(false);
  const [found, setFound] = useState(false);

  useFrame(({ camera }) => {
    // Get player (camera) position
    playerPosRef.current.copy(camera.position);

    const distance = playerPosRef.current.distanceTo(
      new THREE.Vector3(...position)
    );

    // Trigger discovery when player is nearby
    if (distance < 3.5) {
      setShowText(true);
      if (!found) {
        setFound(true);
        if (onClueFound) onClueFound(); // Trigger callback
      }
    } else {
      setShowText(false);
    }

    // Optional: subtle glow pulsing effect
    if (meshRef.current) {
      const scale = 1 + Math.sin(performance.now() / 300) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      {/* Glowing clue sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 13, 13]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffaa00"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {/* Billboard text that always faces the camera */}
      {showText && (
        <Billboard>
          <Text
            position={[0, 1, 0]}
            fontSize={0.25}
            color="white"
            textAlign="center"
            anchorX="center"
            anchorY="bottom"
            maxWidth={3}
            font={cosyFont}
          >
            {message}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
