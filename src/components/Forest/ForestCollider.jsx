// components/Forest/ForestColliders.jsx
import React, { useMemo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

/**
 * items: Array of { name?, size: [w,h,d] (FULL), position: [x,y,z], rotation?: [rx,ry,rz] (radians) }
 * offset: [x,y,z] applied to all items (move the whole set)
 * showDebug: draw transparent meshes matching FULL sizes
 */
export default function ForestColliders({
  items = [],
  offset = [0, 0, 0],
  showDebug = true,
}) {
  const computed = useMemo(
    () =>
      items.map((it, i) => {
        const size = it.size || [1, 1, 1];
        const pos = it.position || [0, 0, 0];
        const rot = it.rotation || [0, 0, 0];
        const half = [size[0] / 2, size[1] / 2, size[2] / 2];
        return {
          key: it.name || `c${i}`,
          size,
          half,
          pos: [pos[0] + offset[0], pos[1] + offset[1], pos[2] + offset[2]],
          rot,
        };
      }),
    [items, offset]
  );

  return (
    <group>
      {/* All static colliders share a fixed rigid body */}
      <RigidBody type="fixed" colliders={false}>
        {computed.map((c) => (
          <CuboidCollider
            key={c.key}
            args={c.half}
            position={c.pos}
            rotation={c.rot}
            restitution={0}
            friction={1}
          />
        ))}
      </RigidBody>

      {showDebug && (
        <group>
          {computed.map((c) => (
            <mesh key={`m-${c.key}`} position={c.pos} rotation={c.rot}>
              <boxGeometry args={c.size} />
              <meshBasicMaterial
                color={
                  c.key.toLowerCase().includes("wall") ? "#ffcc00" : "#00ff88"
                }
                transparent
                opacity={0.25}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
