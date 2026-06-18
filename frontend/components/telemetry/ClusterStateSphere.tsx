"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { ClusterSphereData, TeamSphereNode } from "./sphereTypes";
import {
  makeBaseSphereParticles,
  nodeBaseScale,
  nodeColor,
  teamNodePosition,
} from "./sphereMath";

type Props = {
  data: ClusterSphereData;
  projectorMode?: boolean;
};

export default function ClusterStateSphere({ data, projectorMode = false }: Props) {
  return (
    <div className="cluster-sphere-panel">
      <div className="cluster-sphere-header">
        <div>
          <p className="cluster-sphere-kicker">Live Telemetry</p>
          <h2 className="text-title" style={{ fontSize: 18, fontWeight: 700 }}>Cluster Telemetry Sphere</h2>
        </div>

        <div className="cluster-sphere-live">
          <span className="cluster-sphere-live-dot" />
          LIVE
        </div>
      </div>

      <div className="cluster-sphere-canvas">
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 45 }}
          dpr={projectorMode ? [1, 1.25] : [1, 1.75]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <ParticleSphere data={data} projectorMode={projectorMode} />
        </Canvas>
      </div>

      <SphereLegend data={data} />
    </div>
  );
}

function ParticleSphere({
  data,
  projectorMode,
}: {
  data: ClusterSphereData;
  projectorMode: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRadius = 1.52;
  const particleCount = projectorMode ? 900 : 1400;

  const { positions, colors } = useMemo(
    () => makeBaseSphereParticles(particleCount, sphereRadius),
    [particleCount]
  );

  const maxGpuSeconds = useMemo(() => {
    return Math.max(1, ...data.teams.map((team) => team.gpuSeconds));
  }, [data.teams]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.055;
    groupRef.current.rotation.x = Math.sin(t * 0.18) * 0.035;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>

        <pointsMaterial
          size={projectorMode ? 0.020 : 0.026}
          sizeAttenuation
          vertexColors
          transparent
          opacity={projectorMode ? 0.80 : 0.95}
          depthWrite={false}
        />
      </points>

      <OrbitRing radius={0.72} opacity={0.22} />
      <OrbitRing radius={1.12} opacity={0.30} rotation={[0.6, 0.2, 0]} />
      <OrbitRing radius={1.54} opacity={0.38} rotation={[0.2, 0.8, 0.4]} />

      {data.teams.map((team) => (
        <TeamNode
          key={team.teamId}
          team={team}
          position={teamNodePosition(team, maxGpuSeconds, sphereRadius)}
          projectorMode={projectorMode}
        />
      ))}
    </group>
  );
}

function TeamNode({
  team,
  position,
  projectorMode,
}: {
  team: TeamSphereNode;
  position: THREE.Vector3;
  projectorMode: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const color = useMemo(() => nodeColor(team), [team]);
  const baseRadius = team.rank <= 3 ? 0.045 : 0.032;
  const baseScale = nodeBaseScale(team);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();
    const shouldPulse =
      team.lastRunStatus === "running" || team.lastRunStatus === "pending";
    const pulse = shouldPulse ? 1 + Math.sin(t * 3.0) * 0.14 : 1;
    const failedFlicker =
      team.lastRunStatus === "failed" ? 0.88 + Math.sin(t * 5.0) * 0.06 : 1;

    meshRef.current.scale.setScalar(baseScale * pulse * failedFlicker);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[projectorMode ? baseRadius * 1.1 : baseRadius, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={team.lastRunStatus === "failed" ? 0.82 : 0.96}
      />
    </mesh>
  );
}

function OrbitRing({
  radius,
  opacity,
  rotation = [0, 0, 0],
}: {
  radius: number;
  opacity: number;
  rotation?: [number, number, number];
}) {
  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[radius, 0.0025, 8, 144]} />
      <meshBasicMaterial
        color="#c084fc"
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

function SphereLegend({ data }: { data: ClusterSphereData }) {
  return (
    <div className="cluster-sphere-legend">
      <LegendItem label="Running" value={data.runningJobs} tone="warning" />
      <LegendItem label="Pending" value={data.pendingJobs} tone="info" />
      <LegendItem label="Completed" value={data.completedRuns} tone="success" />
      <LegendItem label="Failed" value={data.failedRuns} tone="danger" />
    </div>
  );
}

function LegendItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "danger" | "info";
}) {
  return (
    <div className={`cluster-sphere-legend-item ${tone}`}>
      <span className="legend-dot" />
      <span className="legend-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
