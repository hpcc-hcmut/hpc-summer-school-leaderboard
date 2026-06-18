import * as THREE from "three";
import type { RunStatus } from "./sphereTypes";

export const SPHERE_COLORS = {
  baseDim: new THREE.Color("#71717A"),
  baseViolet: new THREE.Color("#4B4BA0"),
  basePurple: new THREE.Color("#8F47AE"),
  completed: new THREE.Color("#FFFFFF"),
  running: new THREE.Color("#F59E0B"),
  pending: new THREE.Color("#38BDF8"),
  failed: new THREE.Color("#EF4444"),
};

export const STATUS_COLOR: Record<RunStatus, THREE.Color> = {
  completed: SPHERE_COLORS.completed,
  running: SPHERE_COLORS.running,
  pending: SPHERE_COLORS.pending,
  failed: SPHERE_COLORS.failed,
};
