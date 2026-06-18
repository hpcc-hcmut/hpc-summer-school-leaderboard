# Tech Note — Implementing the Live Cluster State Sphere in Next.js

**Project:** HCMUT HPC Summer School 2026 — Mini Hackathon Leaderboard  
**Module:** Public Leaderboard / Live Telemetry Sphere  
**Target stack:** Next.js App Router, TypeScript, React Three Fiber, three.js  
**Purpose:** Add a live, data-driven telemetry sphere to the hackathon leaderboard. The sphere visualizes Slurm/job activity, team submissions, run status, score intensity, and GPU/resource pressure.

---

## 1. Design Intent

The sphere should not be a decorative 3D object only. It should represent the live state of the hackathon cluster.

Recommended meaning:

| Sphere element | Data meaning |
|---|---|
| Base particles | Global telemetry field / cluster atmosphere |
| Stable bright node | Completed valid run |
| Amber pulsing node | Running or pending run |
| Red node | Failed or timed-out run |
| Node brightness | Score |
| Node size | Workflow complexity / number of agents |
| Distance from center | GPU/resource cost |
| Orbit/ring | Submission history or workload pressure |
| Pulse intensity | Current activity |

The leaderboard table remains the primary UI. The sphere sits in the telemetry zone, usually on the right side of the public dashboard.

---

## 2. Technical Choice

Use:

```txt
three
@react-three/fiber
@types/three
```

Optional:

```txt
@react-three/drei
```

Recommended rendering strategy:

1. Use `THREE.Points` + `BufferGeometry` for the base particle sphere.
2. Use small `mesh` nodes for important team/run markers.
3. Use dynamic import with `ssr: false` so the sphere renders only on the client.
4. Provide a CSS/static fallback when WebGL is unavailable.
5. Keep animation light for projector mode.

Reasoning:

- `THREE.Points` is efficient for many small particles.
- `BufferGeometry` avoids creating thousands of React elements.
- Important nodes need individual size and pulse behavior, so render them as separate meshes instead of trying to make every point have custom size.
- React Server Components do not run browser APIs, so the 3D sphere must be a Client Component.

---

## 3. Installation

From the Next.js frontend project root:

```bash
npm install three @react-three/fiber
npm install -D @types/three
```

Optional helpers:

```bash
npm install @react-three/drei
```

If the project uses React 19, use React Three Fiber v9 or newer. If the project uses React 18, use React Three Fiber v8.

Check installed versions:

```bash
npm ls react three @react-three/fiber
```

---

## 4. Suggested File Structure

```txt
frontend/
  app/
    page.tsx

  components/
    telemetry/
      ClusterStateSphereClient.tsx
      ClusterStateSphere.tsx
      sphereTypes.ts
      sphereMath.ts
      sphereTheme.ts

  styles/
    telemetry-sphere.css
```

---

## 5. Data Contract

Create:

```txt
components/telemetry/sphereTypes.ts
```

```ts
export type RunStatus = "completed" | "running" | "pending" | "failed";

export type TeamSphereNode = {
  teamId: string;
  teamName: string;
  rank: number;
  score: number;
  lastRunStatus: RunStatus;
  runtimeSeconds: number;
  gpuSeconds: number;
  numAgents: number;
};

export type ClusterSphereData = {
  runningJobs: number;
  pendingJobs: number;
  completedRuns: number;
  failedRuns: number;
  teams: TeamSphereNode[];
};
```

Example API payload:

```json
{
  "runningJobs": 6,
  "pendingJobs": 3,
  "completedRuns": 28,
  "failedRuns": 4,
  "teams": [
    {
      "teamId": "team04",
      "teamName": "Team 04",
      "rank": 1,
      "score": 91.2,
      "lastRunStatus": "completed",
      "runtimeSeconds": 182,
      "gpuSeconds": 182,
      "numAgents": 6
    }
  ]
}
```

---

## 6. Theme Tokens

Create:

```txt
components/telemetry/sphereTheme.ts
```

```ts
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
```

---

## 7. Sphere Math Helpers

Create:

```txt
components/telemetry/sphereMath.ts
```

```ts
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
    const color = SPHERE_COLORS.baseDim.clone();

    if (mix > 0.78) {
      color.lerp(SPHERE_COLORS.baseViolet, 0.75);
    } else if (mix > 0.58) {
      color.lerp(SPHERE_COLORS.basePurple, 0.45);
    }

    const brightness = 0.30 + random() * 0.45;
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
```

---

## 8. Client-Only Dynamic Wrapper

Create:

```txt
components/telemetry/ClusterStateSphereClient.tsx
```

```tsx
"use client";

import dynamic from "next/dynamic";
import type { ClusterSphereData } from "./sphereTypes";

const ClusterStateSphere = dynamic(() => import("./ClusterStateSphere"), {
  ssr: false,
  loading: () => (
    <div className="sphere-fallback">
      <div className="sphere-fallback-orb" />
      <span>Loading cluster telemetry…</span>
    </div>
  ),
});

type Props = {
  data: ClusterSphereData;
  projectorMode?: boolean;
};

export default function ClusterStateSphereClient(props: Props) {
  return <ClusterStateSphere {...props} />;
}
```

This wrapper avoids server-side rendering for the WebGL component.

---

## 9. Main Sphere Component

Create:

```txt
components/telemetry/ClusterStateSphere.tsx
```

```tsx
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
          <h2>Cluster State Sphere</h2>
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
          size={projectorMode ? 0.013 : 0.015}
          sizeAttenuation
          vertexColors
          transparent
          opacity={projectorMode ? 0.62 : 0.78}
          depthWrite={false}
        />
      </points>

      <OrbitRing radius={0.72} opacity={0.10} />
      <OrbitRing radius={1.12} opacity={0.14} rotation={[0.6, 0.2, 0]} />
      <OrbitRing radius={1.54} opacity={0.18} rotation={[0.2, 0.8, 0.4]} />

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
        color="#8F47AE"
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
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
```

---

## 10. CSS

Create:

```txt
styles/telemetry-sphere.css
```

Then import it from `app/layout.tsx` or a global stylesheet.

```css
.cluster-sphere-panel {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    radial-gradient(circle at 50% 30%, rgba(75, 75, 160, 0.24), transparent 42%),
    rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(12px);
  min-height: 520px;
  padding: 16px;
  color: #ffffff;
}

.cluster-sphere-header {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.cluster-sphere-kicker {
  margin: 0 0 4px;
  color: #a1a1aa;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cluster-sphere-header h2 {
  margin: 0;
  font-size: 22px;
  line-height: 28px;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.cluster-sphere-live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 9999px;
  padding: 6px 10px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.28);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.cluster-sphere-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #22c55e;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.75);
}

.cluster-sphere-canvas {
  position: absolute;
  inset: 56px 0 72px;
}

.cluster-sphere-legend {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.cluster-sphere-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  border-radius: 12px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #a1a1aa;
  font-size: 12px;
  font-weight: 650;
}

.cluster-sphere-legend-item strong {
  margin-left: auto;
  color: #ffffff;
}

.legend-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 9999px;
}

.cluster-sphere-legend-item.success .legend-dot {
  background: #22c55e;
}

.cluster-sphere-legend-item.warning .legend-dot {
  background: #f59e0b;
}

.cluster-sphere-legend-item.danger .legend-dot {
  background: #ef4444;
}

.cluster-sphere-legend-item.info .legend-dot {
  background: #38bdf8;
}

.sphere-fallback {
  display: grid;
  place-items: center;
  min-height: 520px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    radial-gradient(circle, rgba(75, 75, 160, 0.32), transparent 38%),
    rgba(0, 0, 0, 0.42);
  color: #a1a1aa;
}

.sphere-fallback-orb {
  width: 220px;
  height: 220px;
  border-radius: 9999px;
  background:
    radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.24), transparent 18%),
    radial-gradient(circle, rgba(143, 71, 174, 0.34), transparent 60%),
    rgba(75, 75, 160, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

@media (prefers-reduced-motion: reduce) {
  .cluster-sphere-live-dot {
    box-shadow: none;
  }
}
```

---

## 11. Use in Next.js Page

Example:

```txt
app/page.tsx
```

```tsx
import ClusterStateSphereClient from "@/components/telemetry/ClusterStateSphereClient";
import type { ClusterSphereData } from "@/components/telemetry/sphereTypes";

const mockSphereData: ClusterSphereData = {
  runningJobs: 6,
  pendingJobs: 3,
  completedRuns: 28,
  failedRuns: 4,
  teams: [
    {
      teamId: "team04",
      teamName: "Team 04",
      rank: 1,
      score: 91.2,
      lastRunStatus: "completed",
      runtimeSeconds: 182,
      gpuSeconds: 182,
      numAgents: 6,
    },
    {
      teamId: "team01",
      teamName: "Team 01",
      rank: 2,
      score: 87.5,
      lastRunStatus: "running",
      runtimeSeconds: 196,
      gpuSeconds: 260,
      numAgents: 8,
    },
    {
      teamId: "team07",
      teamName: "Team 07",
      rank: 3,
      score: 84.9,
      lastRunStatus: "pending",
      runtimeSeconds: 211,
      gpuSeconds: 340,
      numAgents: 5,
    },
    {
      teamId: "team08",
      teamName: "Team 08",
      rank: 8,
      score: 42.0,
      lastRunStatus: "failed",
      runtimeSeconds: 0,
      gpuSeconds: 90,
      numAgents: 4,
    },
  ],
};

export default function Page() {
  return (
    <main className="telemetry-shell">
      <section className="dashboard-grid">
        <div className="leaderboard-zone">
          {/* Leaderboard table goes here */}
        </div>

        <aside className="telemetry-zone">
          <ClusterStateSphereClient data={mockSphereData} projectorMode />
        </aside>
      </section>
    </main>
  );
}
```

Example dashboard CSS:

```css
.telemetry-shell {
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(circle at 20% 10%, rgba(75, 75, 160, 0.28), transparent 30%),
    radial-gradient(circle at 80% 20%, rgba(143, 71, 174, 0.22), transparent 28%),
    #050509;
  color: #ffffff;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 16px;
  align-items: stretch;
}

.leaderboard-zone,
.telemetry-zone {
  min-width: 0;
}

@media (max-width: 1100px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 12. Connect to Public Leaderboard API

Recommended endpoint:

```txt
GET /api/public/leaderboard
```

The response should include both leaderboard rows and telemetry sphere data.

Example normalized response:

```ts
type PublicLeaderboardResponse = {
  lastUpdated: string;
  sphere: ClusterSphereData;
  rows: Array<{
    rank: number;
    teamId: string;
    teamName: string;
    score: number;
    correctness: number;
    evidence: number;
    runtimeSeconds: number;
    gpuSeconds: number;
    efficiency: number;
    status: string;
    lastRunAt: string;
  }>;
};
```

For the first implementation, use polling every 5 seconds:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { ClusterSphereData } from "@/components/telemetry/sphereTypes";

export function usePublicLeaderboard(initialSphere: ClusterSphereData) {
  const [sphere, setSphere] = useState(initialSphere);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/public/leaderboard", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        if (mounted && data.sphere) {
          setSphere(data.sphere);
        }
      } catch {
        // Keep last known data.
      }
    }

    const id = window.setInterval(load, 5000);
    load();

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  return sphere;
}
```

Later, replace polling with Server-Sent Events:

```txt
GET /api/public/events
```

---

## 13. Server-Sent Events Option

Example client hook:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { ClusterSphereData } from "@/components/telemetry/sphereTypes";

export function useSphereSSE(initialSphere: ClusterSphereData) {
  const [sphere, setSphere] = useState(initialSphere);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const events = new EventSource("/api/public/events");

    events.onopen = () => setConnected(true);

    events.onerror = () => {
      setConnected(false);
    };

    events.addEventListener("sphere", (event) => {
      try {
        const nextSphere = JSON.parse(event.data) as ClusterSphereData;
        setSphere(nextSphere);
      } catch {
        // Ignore malformed event.
      }
    });

    return () => {
      events.close();
    };
  }, []);

  return { sphere, connected };
}
```

Example event format:

```txt
event: sphere
data: {"runningJobs":6,"pendingJobs":3,"completedRuns":28,"failedRuns":4,"teams":[]}
```

For the school deployment, polling is simpler. SSE is better if you want the board to feel truly live without aggressive refresh.

---

## 14. Performance Rules

Recommended defaults:

| Mode | Particle count | DPR | Pointer interaction | Notes |
|---|---:|---:|---|---|
| Projector | 700–1000 | 1–1.25 | Off | safest mode |
| Desktop | 1200–1800 | 1–1.75 | Optional | good balance |
| Admin detail | 800–1200 | 1–1.5 | On | can support hover/click |
| Low power | 300–600 | 1 | Off | fallback-like mode |

Rules:

- Do not render thousands of particles as individual React components.
- Keep base particles inside one `BufferGeometry`.
- Limit live node meshes to team-level or run-level summary, not every trace event.
- Do not use bloom/postprocessing in the first version.
- Keep the sphere panel isolated from leaderboard table rendering.
- Avoid rerendering geometry on every polling tick unless the particle count or seed changes.
- Only team nodes should respond to changing data.

---

## 15. Projector Mode

For the school room display:

```tsx
<ClusterStateSphereClient data={sphereData} projectorMode />
```

Projector mode should:

- Reduce particle count
- Reduce DPR
- Disable pointer interaction
- Keep legend visible
- Increase node radius slightly
- Keep animation slow
- Avoid strong bloom/glow

---

## 16. Accessibility and Fallback

The 3D sphere is supplementary. The same telemetry must be available as text in the legend and metric cards.

Do not rely on color alone. Use labels:

```txt
Running 6
Pending 3
Completed 28
Failed 4
```

Fallback states:

```txt
Loading cluster telemetry…
WebGL unavailable
Showing last known telemetry
Live connection lost
```

CSS fallback should still look like an orb, even if the Canvas fails.

---

## 17. Common Issues

### Error: `window is not defined`

Cause: WebGL component rendered on the server.

Fix:

- Keep `ClusterStateSphere.tsx` as a Client Component.
- Import it through `next/dynamic` with `ssr: false`.
- Put dynamic import inside a Client Component wrapper.

### Error: hydration mismatch

Cause: random particle positions generated differently between server and client.

Fix:

- Generate particles only inside the client-rendered component.
- Use deterministic seeded random.
- Avoid rendering Canvas on the server.

### Sphere is too slow on projector laptop

Fix:

- Use `projectorMode`.
- Lower particle count to 600–900.
- Lower DPR to `[1, 1.25]`.
- Remove postprocessing.
- Disable pointer interaction.

### Nodes are not visually different enough

Fix:

- Increase `baseRadius` in `TeamNode`.
- Increase opacity.
- Use semantic colors.
- Add a small legend below the sphere.

### Need different point sizes per particle

`THREE.PointsMaterial` uses one material size for all points. For per-particle size, use a custom shader or render important nodes as separate meshes. For this leaderboard, separate meshes for important nodes are simpler and safer.

---

## 18. Minimal Integration Checklist

- [ ] Install `three`, `@react-three/fiber`, and `@types/three`.
- [ ] Add `sphereTypes.ts`.
- [ ] Add `sphereTheme.ts`.
- [ ] Add `sphereMath.ts`.
- [ ] Add `ClusterStateSphere.tsx`.
- [ ] Add `ClusterStateSphereClient.tsx`.
- [ ] Import sphere CSS globally.
- [ ] Place sphere in the right telemetry zone.
- [ ] Connect `data` from `/api/public/leaderboard`.
- [ ] Test projector mode.
- [ ] Test fallback by disabling WebGL or forcing loading state.
- [ ] Verify that leaderboard table remains readable.

---

## 19. Suggested Next Iterations

After the minimal implementation works:

1. Add hover/click node interaction in admin mode.
2. Connect each node to the latest run detail page.
3. Add run submission trails.
4. Add agent fan-out visualization for selected team.
5. Add SSE live updates.
6. Add low-power safe mode toggle.
7. Add hidden keyboard shortcut for projector mode:

```txt
P = projector mode
F = fullscreen mode
M = mute animation
```

---

## 20. Implementation Priority

Recommended order:

1. Static mock sphere with fake data.
2. Put it into the real leaderboard layout.
3. Connect real public leaderboard API.
4. Add status legend.
5. Add projector mode.
6. Add SSE/polling.
7. Add admin interactivity later.

The first version should prioritize reliability and readability over visual complexity.

