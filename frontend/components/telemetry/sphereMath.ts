import * as THREE from "three";
import type { TeamSphereNode } from "./sphereTypes";
import { SPHERE_COLORS, STATUS_COLOR } from "./sphereTheme";

function hashString(input: string): number {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return Math.abs(hash >>> 0);
}

function seededRandom(seed: number): () => number {
  let value = seed || 1;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeBaseSphereParticles(
  count: number,
  radius: number,
  seed = 20260619
): {
  positions: Float32Array;
  colors: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const random = seededRandom(seed);

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const radial = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    const shellJitter = 0.92 + random() * 0.16;
    const x = Math.cos(theta) * radial;
    const z = Math.sin(theta) * radial;

    const p = new THREE.Vector3(x, y, z)
      .normalize()
      .multiplyScalar(radius * shellJitter);

    positions[i * 3 + 0] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;

    const mix = random();
    // Start with a brighter violet/blue base color
    const color = new THREE.Color("#4F46E5").clone(); // Indigo base

    if (mix > 0.85) {
      color.lerp(new THREE.Color("#FFFFFF"), 0.6); // White highlight particles
    } else if (mix > 0.60) {
      color.lerp(new THREE.Color("#C084FC"), 0.8); // Neon purple particles
    } else if (mix > 0.35) {
      color.lerp(new THREE.Color("#38BDF8"), 0.7); // Bright sky blue particles
    }

    // High brightness factor: range 0.7 to 1.2
    const brightness = 0.70 + random() * 0.50;
    color.multiplyScalar(brightness);

    colors[i * 3 + 0] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return { positions, colors };
}

export function teamNodePosition(
  team: TeamSphereNode,
  maxGpuSeconds: number,
  sphereRadius: number
): THREE.Vector3 {
  const seed = hashString(team.teamId);
  const a = (seed % 10000) / 10000;
  const b = ((seed >> 8) % 10000) / 10000;

  const theta = a * Math.PI * 2;
  const phi = Math.acos(1 - 2 * b);

  const normalizedGpuCost = Math.min(
    1,
    team.gpuSeconds / Math.max(1, maxGpuSeconds)
  );

  const resourceRadius = sphereRadius * (0.42 + normalizedGpuCost * 0.56);

  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  ).multiplyScalar(resourceRadius);
}

export function nodeColor(team: TeamSphereNode): THREE.Color {
  const statusColor = STATUS_COLOR[team.lastRunStatus].clone();

  if (team.lastRunStatus === "completed") {
    const scoreIntensity = Math.min(1, Math.max(0.25, team.score / 100));
    return statusColor.lerp(SPHERE_COLORS.basePurple, 1 - scoreIntensity);
  }

  return statusColor;
}

export function nodeBaseScale(team: TeamSphereNode): number {
  const rankBoost = team.rank <= 3 ? 1.35 : 1.0;
  const agentBoost = Math.min(1.45, 0.85 + team.numAgents * 0.08);
  return rankBoost * agentBoost;
}
