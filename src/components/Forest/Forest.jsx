// components/Forest/Forest.jsx
import React, { useMemo, useEffect, forwardRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import forestModelUrl from "./pine_forest.glb";

const NAME_HINTS = [
  "sky",
  "skydome",
  "skybox",
  "background",
  "backdrop",
  "hdr",
  "dome",
  "cloud",
];

function approxWorldRadius(mesh) {
  const geo = mesh.geometry;
  if (!geo) return 0;
  geo.computeBoundingSphere?.();
  const r = geo.boundingSphere?.radius ?? 0;
  const s = mesh.scale ? Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z) : 1;
  return r * s;
}
function isLikelySkydome(mesh) {
  if (!mesh?.isMesh) return false;
  const n = (mesh.name || "").toLowerCase();
  if (NAME_HINTS.some((h) => n.includes(h))) return true;
  const size = approxWorldRadius(mesh);
  if (size < 60) return false;
  const type = mesh.geometry?.type || "";
  const spherey = /(Sphere|Icosahedron)/i.test(type);
  const m = mesh.material;
  const unlit = m?.type === "MeshBasicMaterial";
  const backside = m?.side === THREE.BackSide;
  const noShadows = mesh.castShadow !== true && mesh.receiveShadow !== true;
  return (spherey && (unlit || backside || noShadows)) || (unlit && noShadows);
}

const Forest = forwardRef(function Forest(
  {
    scale = 1,
    castShadows = false,
    receiveShadows = true,
    envMapIntensity = 1.0,
    hideSkydomes = true,
    stripLights = true,
    stripFog = true,
    forceHide = [],
    debugNames = false,
    ...props
  },
  ref
) {
  const { scene: gltfScene } = useGLTF(forestModelUrl);
  const root = useMemo(() => gltfScene.clone(true), [gltfScene]);

  useEffect(() => {
    if ("background" in root) root.background = null;
    if ("environment" in root) root.environment = null;

    root.traverse((obj) => {
      if (stripLights && (obj.isLight || /Light$/.test(obj.type))) {
        obj.visible = false;
        return;
      }
      if (!obj.isMesh) return;

      obj.castShadow = false;
      obj.receiveShadow = !!receiveShadows;
      obj.frustumCulled = true;

      const m = obj.material;
      if (m && "envMapIntensity" in m) {
        m.envMapIntensity = envMapIntensity;
        m.needsUpdate = true;
      }

      const lname = (obj.name || "").toLowerCase();
      if (forceHide.some((s) => lname.includes(s.toLowerCase()))) {
        obj.visible = false;
        return;
      }
      if (hideSkydomes && isLikelySkydome(obj)) obj.visible = false;
    });

    if (stripFog) {
      root.traverse((o) => {
        if (o.isScene && o.fog) o.fog = null;
      });
    }

    if (debugNames) {
      const all = [];
      root.traverse((o) => {
        if (o.isMesh) {
          const r = approxWorldRadius(o);
          all.push({
            name: o.name,
            r: Math.round(r),
            mat: o.material?.type,
            visible: o.visible,
          });
        }
      });
      console.table(all.sort((a, b) => b.r - a.r).slice(0, 30));
    }
  }, [
    root,
    castShadows,
    receiveShadows,
    envMapIntensity,
    hideSkydomes,
    stripLights,
    stripFog,
    forceHide,
    debugNames,
  ]);

  return (
    <group {...props}>
      <primitive ref={ref} object={root} scale={scale} />
    </group>
  );
});

export default Forest;
useGLTF.preload(forestModelUrl);
