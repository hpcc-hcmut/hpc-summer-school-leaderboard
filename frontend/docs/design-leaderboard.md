---
version: "alpha"
name: "HPC School Hackathon Telemetry Board"
description: "A real-time leaderboard and admin dashboard design system for HCMUT HPC Summer School 2026 Mini Hackathon. The interface visualizes team rankings, Slurm run states, scoring breakdowns, GPU/resource usage, and multi-agent LLM workflow telemetry."
source_inspiration: "Ethereal Telemetry HUD"
product:
  event: "HCMUT HPC Summer School 2026"
  module: "Mini Hackathon Leaderboard"
  modes:
    - "Public real-time leaderboard"
    - "Admin console"
    - "Run trace viewer"
principles:
  - "Readable first, cinematic second"
  - "Telemetry-oriented, not generic scoreboard"
  - "Real-time state must be visible but not visually noisy"
  - "Scores must be explainable through breakdowns"
  - "Admin actions must be safe, auditable, and reversible where possible"
---

# HPC School Hackathon Telemetry Board — Design System

## 1. Product Intent

The leaderboard is the public and operational interface for the HCMUT HPC Summer School 2026 Mini Hackathon.

The hackathon evaluates student teams on resource-aware multi-agent LLM workflows running on an HPC cluster. Teams submit Slurm jobs that run agentic workflows, produce answers, collect evidence, and generate metadata/trace outputs. The leaderboard visualizes the latest valid results in real time.

The interface should feel like a modern HPC/AI operations dashboard rather than a conventional classroom scoreboard.

## 2. Design Positioning

### Core Style

A dark telemetry HUD with glass surfaces, thin borders, soft glow, dot-matrix background motion, and high-contrast data presentation.

The design should communicate:

- HPC infrastructure
- Live workload execution
- Agentic AI workflows
- Resource-aware optimization
- Research-grade evaluation

### What to Preserve from the Original Design

The original `Ethereal Telemetry HUD` style is used as a visual base. Preserve:

- Dark glass surface treatment
- Accent colors `#4B4BA0` and `#8F47AE`
- 4px spacing rhythm
- 16px rounded surfaces
- 9999px rounded badges
- Linear iconography
- Subtle technical background field
- Slow breathing motion
- Thin border depth

### What to Change

The original design was suitable for authentication/login sections. A leaderboard is data-heavy, public-facing, and likely projected on a screen. Therefore:

- Increase typography scale
- Increase contrast
- Reduce decorative density
- Make tables readable from distance
- Add semantic status colors
- Make animation operational, not ornamental
- Keep WebGL subtle and optional

---

# 3. Color System

## Core Palette

```yaml
colors:
  primary: "#4B4BA0"
  secondary: "#FFFFFF"
  tertiary: "#8F47AE"

  background: "#050509"
  surface: "#000000"
  surface-glass: "rgba(0, 0, 0, 0.42)"
  surface-glass-strong: "rgba(0, 0, 0, 0.62)"

  text-primary: "#FFFFFF"
  text-secondary: "#A1A1AA"
  text-muted: "#71717A"

  border-subtle: "rgba(255, 255, 255, 0.08)"
  border-default: "rgba(255, 255, 255, 0.10)"
  border-strong: "rgba(255, 255, 255, 0.18)"

  accent-primary: "#4B4BA0"
  accent-tertiary: "#8F47AE"
```

## Semantic Palette

```yaml
semantic:
  success: "#22C55E"   # completed / accepted / valid
  warning: "#F59E0B"   # running / pending / degraded
  danger: "#EF4444"    # failed / invalid / deleted
  info: "#38BDF8"      # submitted / queued / neutral live update
```

## Usage Rules

### Do

- Use `primary` for main emphasis, active navigation, score accents, and live indicators.
- Use `tertiary` for rank highlights, top team emphasis, and high-value deltas.
- Use semantic colors only for operational states.
- Use white text on dark surfaces for public display readability.

### Do Not

- Do not color entire table rows with semantic colors.
- Do not use excessive gradients in dense data areas.
- Do not use low-contrast gray text for key leaderboard metrics.
- Do not introduce extra decorative colors unless a new semantic state requires it.

---

# 4. Typography

The original 18px/12px scale is too small for a projected leaderboard. Use a larger dashboard scale.

```yaml
typography:
  display:
    fontFamily: "Inter"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: "48px"
    letterSpacing: "-0.035em"

  title:
    fontFamily: "Inter"
    fontSize: "24px"
    fontWeight: 650
    lineHeight: "32px"
    letterSpacing: "-0.025em"

  subtitle:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
    letterSpacing: "-0.01em"

  metric:
    fontFamily: "Inter"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "40px"
    letterSpacing: "-0.035em"

  table-header:
    fontFamily: "Inter"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: "18px"
    letterSpacing: "0.08em"
    textTransform: "uppercase"

  table-body:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"

  utility:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.08em"
    textTransform: "uppercase"
```

## Typography Rules

- Public leaderboard table body must not go below 16px.
- Admin console may use 13–14px for dense tables.
- Score values should use metric typography.
- Rank numbers should be large and visually stable.
- Avoid overly condensed fonts; leaderboard must remain readable at distance.

---

# 5. Layout System

## Spacing

```yaml
spacing:
  base: "4px"
  scale:
    - "4px"
    - "8px"
    - "12px"
    - "16px"
    - "24px"
    - "32px"
    - "48px"

  section-padding: "32px"
  card-padding: "16px"
  dense-card-padding: "12px"
  dashboard-gap: "16px"
  table-row-height: "56px"
```

## Page Frame

The public board uses a full-screen dashboard composition.

```txt
┌──────────────────────────────────────────────────────────────┐
│ Top Status Bar                                               │
├──────────────────────────────────────────────────────────────┤
│ Current Leader / Hero Metric Strip                           │
├──────────────────────────────────────┬───────────────────────┤
│ Main Leaderboard Table               │ Cluster Telemetry     │
│                                      │ Latest Run States     │
├──────────────────────────────────────┴───────────────────────┤
│ Live Run Ticker                                               │
└──────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Large display / projector

- Use two-column layout.
- Main leaderboard takes 70–75% width.
- Telemetry panel takes 25–30% width.
- Show top 10 teams by default.

### Laptop

- Keep leaderboard table primary.
- Telemetry panel moves below table.
- Hide non-critical columns behind expandable row detail.

### Mobile

- Use ranked cards instead of table.
- Show score, correctness, runtime, status, and latest run only.
- Admin should remain usable but not optimized for heavy operations.

---

# 6. Surface and Depth

## Glass Card Recipe

```css
.glass-card {
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow:
    0 0 0 0 rgba(0, 0, 0, 0),
    0 0 15px 0 rgba(255, 255, 255, 0.05);
}
```

## Strong Data Panel Recipe

```css
.data-panel {
  background: rgba(0, 0, 0, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 20px;
  backdrop-filter: blur(16px);
}
```

## Gradient Border Shell

Use only for hero cards, top leader card, and login/admin entry.

```css
.gradient-shell {
  border-radius: 20px;
  padding: 1px;
  background:
    linear-gradient(
      135deg,
      rgba(75, 75, 160, 0.60),
      rgba(143, 71, 174, 0.35),
      rgba(255, 255, 255, 0.08)
    );
}

.gradient-shell > .inner {
  border-radius: 19px;
  background: rgba(0, 0, 0, 0.62);
}
```

## Depth Rules

- Use glass surfaces consistently.
- Use gradient borders sparingly.
- Use stronger background opacity for tables than decorative cards.
- Do not use heavy drop shadows.
- Do not blur behind dense text more than necessary.

---

# 7. Shape System

```yaml
radii:
  card: "16px"
  large-card: "20px"
  badge: "9999px"
  button: "12px"
  input: "12px"
```

## Shape Rules

- Cards: 16px or 20px
- Buttons: 12px
- Badges: 9999px
- Table rows: no individual rounded row except highlighted top row or selected row
- Modal/dialog: 20px

---

# 8. Iconography

```yaml
iconography:
  treatment: "linear"
  recommendedSet: "Solar"
  strokeWidth: "1.5px"
```

## Suggested Icons

| Concept | Icon |
|---|---|
| Score | Trophy / Medal |
| Runtime | Timer |
| GPU | Chip / GPU |
| Slurm job | Server / Terminal |
| Trace | Route / Timeline |
| Evidence | File Check |
| Correctness | Check Circle |
| Failed run | X Circle |
| Pending run | Clock |
| Admin delete | Trash |
| Rejudge | Refresh |

---

# 9. Public Leaderboard Page

## Route

```txt
/
```

or

```txt
/leaderboard
```

## Main Sections

```tsx
<PublicLeaderboardPage>
  <TelemetryBackground />
  <TopStatusBar />
  <HeroLeaderCard />
  <DashboardGrid>
    <LeaderboardTable />
    <ClusterTelemetryPanel />
  </DashboardGrid>
  <LiveRunTicker />
</PublicLeaderboardPage>
```

## Top Status Bar

Content:

```txt
HCMUT HPC Summer School 2026
Mini Hackathon Leaderboard
LIVE
Last updated: HH:mm:ss
```

Optional right-side metrics:

```txt
Teams: 09
Runs: 42
Active: 06
Pending: 03
```

## Hero Leader Card

Purpose: highlight current first place.

Fields:

```yaml
teamName: "Team 04"
rank: 1
score: 91.2
scoreDelta: "+4.8"
correctness: "86%"
evidence: "94%"
runtime: "182s"
gpuEfficiency: "0.78"
latestRunStatus: "completed"
```

## Leaderboard Table

Recommended columns:

```txt
Rank
Team
Score
Correctness
Evidence
Runtime
GPU Cost
Efficiency
Status
Last Run
```

### Row Behavior

- Rank 1: gradient accent row
- Rank 2–3: subtle border highlight
- Running row: soft warning pulse on status badge only
- Failed row: muted row text, danger badge
- Invalidated row: hidden from public leaderboard by default

### Example Row

```txt
#1  Team 04  91.2  86%  94%  182s  182 GPU-s  0.78  Completed  14:32
```

## Cluster Telemetry Panel

Metrics:

```txt
Running jobs
Pending jobs
Completed runs
Failed runs
Average runtime
Best runtime
Total GPU seconds
Most used model
```

## Latest Run Ticker

Examples:

```txt
Team 05 submitted run_00128
Team 03 completed run_00127: 84.9 pts
Team 08 failed run_00126: timeout
Team 01 improved by +2.4 pts
```

Ticker should move slowly or update discretely. Avoid marquee text that distracts from the table.

---

# 10. Admin Console

## Routes

```txt
/admin/login
/admin
/admin/runs
/admin/runs/:runId
/admin/teams
/admin/settings
```

## Admin Login

The login page may closely follow the original Ethereal Telemetry HUD composition because the source design was authentication-oriented.

Recommended sections:

```tsx
<AdminLoginPage>
  <TelemetryBackground />
  <LoginCard />
</AdminLoginPage>
```

Fields:

```txt
Username
Password
Login
```

Optional:

```txt
HCMUT HPC Summer School 2026
Hackathon Admin Console
```

## Admin Runs Page

Columns:

```txt
Run ID
Team
Score
Correctness
Evidence
Runtime
GPU Seconds
Models
Status
Submitted At
Actions
```

Actions:

```txt
View Trace
Invalidate
Restore
Delete
Rejudge
Export JSON
```

## Admin Run Detail Page

Sections:

```txt
Run Metadata
Score Breakdown
Trace Timeline
Sub-agent Execution Graph
Model Usage
Token Usage
Runtime Breakdown
Resource Usage
Raw Answer
Evidence Files
Evaluator Logs
Admin Actions
```

## Admin Safety Rules

- Delete should require confirmation.
- Prefer invalidate over delete when preserving audit history.
- Deleted runs should not appear on public board.
- Invalidated runs should remain visible in admin.
- Admin action log should record who performed the action and when.

---

# 11. Run Trace Viewer

The trace viewer is important because the hackathon evaluates not only final answers but also workflow design.

## Layout

```txt
┌─────────────────────────────────────────────┐
│ Run Summary                                 │
├─────────────────────────────────────────────┤
│ Score Breakdown                             │
├─────────────────────────────────────────────┤
│ Timeline                                    │
│ 00:00 submit                                │
│ 00:03 planner_agent started                 │
│ 00:14 code_agent completed                  │
│ 00:18 perf_agent completed                  │
│ 00:22 aggregator started                    │
│ 00:31 answer generated                      │
├─────────────────────────────────────────────┤
│ Agent Cards                                 │
│ planner | code | perf | csv | dataset | agg │
└─────────────────────────────────────────────┘
```

## Agent Card Fields

```yaml
agentName: "code_agent"
model: "qwen2.5-coder:7b"
status: "completed"
startTime: "14:32:11"
endTime: "14:32:46"
runtimeSeconds: 35
tokensIn: 4200
tokensOut: 900
filesRead: 17
evidenceCount: 8
```

---

# 12. Scoring Visualization

The final score should always be decomposable.

## Score Breakdown

```yaml
score:
  final: 91.2
  correctness: 86.0
  evidence: 94.0
  runtime: 88.0
  resource_efficiency: 93.0
```

## Visual Components

- Radial score is acceptable for hero card only.
- Admin should use horizontal bars or compact table.
- Public board should show final score as the largest metric.
- Do not over-visualize every submetric in the main table.

## Public Score Formula Display

Optional footer or info modal:

```txt
Final score combines answer correctness, evidence quality, runtime, and GPU/resource efficiency.
```

Avoid exposing hidden evaluator weights if the scoring system should not be gamed during the hackathon.

---

# 13. Data Model Expectations

## Public Leaderboard Response

```json
{
  "event": "HCMUT HPC Summer School 2026",
  "challenge": "Mini Hackathon",
  "last_updated": "2026-06-19T14:32:10+07:00",
  "teams": [
    {
      "rank": 1,
      "team_id": "team04",
      "team_name": "Team 04",
      "score": 91.2,
      "score_delta": 4.8,
      "correctness": 86.0,
      "evidence": 94.0,
      "runtime_seconds": 182,
      "gpu_seconds": 182,
      "efficiency": 0.78,
      "status": "completed",
      "last_run_id": "run_20260619_00124",
      "last_run_at": "2026-06-19T14:32:10+07:00"
    }
  ],
  "telemetry": {
    "running_jobs": 6,
    "pending_jobs": 3,
    "completed_runs": 28,
    "failed_runs": 4,
    "avg_runtime_seconds": 230,
    "best_runtime_seconds": 182,
    "total_gpu_seconds": 8120,
    "most_used_model": "qwen2.5-coder:7b"
  }
}
```

## Run Detail Response

```json
{
  "run_id": "run_20260619_00124",
  "team_id": "team04",
  "status": "completed",
  "submitted_at": "2026-06-19T14:29:08+07:00",
  "started_at": "2026-06-19T14:30:01+07:00",
  "completed_at": "2026-06-19T14:32:10+07:00",
  "score": {
    "final": 91.2,
    "correctness": 86.0,
    "evidence": 94.0,
    "runtime": 88.0,
    "resource_efficiency": 93.0
  },
  "metrics": {
    "runtime_seconds": 182,
    "gpu_seconds": 182,
    "num_agents": 6,
    "num_models": 3,
    "tokens_total": 18420
  },
  "models": [
    "qwen2.5-coder:7b",
    "llama3.1:8b",
    "phi4-mini"
  ],
  "trace": [
    {
      "agent": "planner_agent",
      "status": "completed",
      "started_at": "2026-06-19T14:30:03+07:00",
      "completed_at": "2026-06-19T14:30:14+07:00",
      "runtime_seconds": 11
    }
  ]
}
```

---

# 14. API Surface

## Public API

```txt
GET /api/public/leaderboard
GET /api/public/telemetry
GET /api/public/runs/latest
```

## Admin API

```txt
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me

GET    /api/admin/runs
GET    /api/admin/runs/:runId
POST   /api/admin/runs/:runId/invalidate
POST   /api/admin/runs/:runId/restore
DELETE /api/admin/runs/:runId
POST   /api/admin/runs/:runId/rejudge

GET    /api/admin/teams
GET    /api/admin/teams/:teamId
PATCH  /api/admin/teams/:teamId
```

## Real-time Updates

Preferred:

```txt
Server-Sent Events
GET /api/public/events
```

Alternative:

```txt
WebSocket
/ws/leaderboard
```

Polling fallback:

```txt
GET /api/public/leaderboard every 5 seconds
```

For school deployment, Server-Sent Events is usually enough and simpler than WebSocket.

---

# 15. Motion System

## Motion Level

```yaml
motion:
  level: "moderate"
  durations:
    fast: "150ms"
    normal: "300ms"
    slow: "1000ms"
  easing:
    standard: "ease"
    emphasized: "cubic-bezier(0.4, 0, 0.2, 1)"
```

## Recommended Motion

- Live badge pulse: slow, subtle
- Row update flash: 150ms
- Rank movement: 300ms
- Background breathing: 1000ms or slower
- Modal open/close: 150–300ms

## Avoid

- Fast marquee animations
- Constant particle movement over table area
- Animated numbers that take too long to settle
- Excessive hover effects on public display

---

# 16. WebGL / Canvas Background

## Intent

Use a full-bleed dot-matrix particle field to create a technical, meditative, HPC-like atmosphere.

## Requirements

```yaml
webgl:
  scene: "Full-bleed background field"
  effect: "Dot-matrix particle field"
  primitives: "Dot particles + soft depth fade"
  motion: "Slow breathing pulse"
  interaction: "Pointer-reactive drift only on desktop/admin login"
  render: "Canvas-backed effect"
  fallback: "Static radial gradient + noise layer"
```

## Public Display Settings

```yaml
projectorMode:
  particleOpacity: 0.18
  particleDensity: "low"
  pointerInteraction: false
  animation: "slow"
```

## Login/Admin Settings

```yaml
interactiveMode:
  particleOpacity: 0.28
  particleDensity: "medium"
  pointerInteraction: true
  animation: "slow"
```

---

# 17. Accessibility and Reliability

## Contrast

- Main text must remain readable on projector.
- Critical metrics should use white or near-white.
- Secondary text can use `#A1A1AA`.
- Muted text should not be used for key values.

## Motion Preference

Respect:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition-duration: 0ms !important;
  }
}
```

## Degraded Mode

The leaderboard should still work if:

- WebGL fails
- SSE/WebSocket disconnects
- Admin session expires
- Backend temporarily returns stale data
- A run has missing trace metadata

Show states clearly:

```txt
Live connection lost
Showing last known result
Last updated: HH:mm:ss
```

---

# 18. Implementation Notes for Next.js

## Recommended Structure

```txt
app/
  page.tsx
  admin/
    login/page.tsx
    page.tsx
    runs/page.tsx
    runs/[runId]/page.tsx
    teams/page.tsx
  api/
    public/
    admin/

components/
  layout/
    TelemetryBackground.tsx
    DashboardShell.tsx
    TopStatusBar.tsx

  leaderboard/
    HeroLeaderCard.tsx
    LeaderboardTable.tsx
    LeaderboardRow.tsx
    ClusterTelemetryPanel.tsx
    LiveRunTicker.tsx
    ScoreBadge.tsx
    StatusBadge.tsx

  admin/
    AdminSidebar.tsx
    RunsTable.tsx
    RunDetailPanel.tsx
    TraceTimeline.tsx
    ScoreBreakdown.tsx
    AdminActionBar.tsx

lib/
  api.ts
  types.ts
  scoring.ts
  format.ts
```

## Styling Stack

Recommended:

```txt
Next.js latest
TypeScript
Tailwind CSS
shadcn/ui style primitives if useful
lucide-react or Solar-compatible linear icons
SSE for live updates
```

---

# 19. Tailwind Token Mapping

```ts
export const leaderboardTheme = {
  colors: {
    background: "#050509",
    surface: "#000000",
    primary: "#4B4BA0",
    tertiary: "#8F47AE",
    textPrimary: "#FFFFFF",
    textSecondary: "#A1A1AA",
    textMuted: "#71717A",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#38BDF8",
  },
  radii: {
    card: "16px",
    largeCard: "20px",
    badge: "9999px",
    button: "12px",
  },
  spacing: {
    base: "4px",
    dashboardGap: "16px",
    sectionPadding: "32px",
  },
};
```

---

# 20. Example CSS Utilities

```css
.telemetry-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 10%, rgba(75, 75, 160, 0.28), transparent 30%),
    radial-gradient(circle at 80% 20%, rgba(143, 71, 174, 0.22), transparent 28%),
    #050509;
  color: #ffffff;
  overflow: hidden;
}

.glass-card {
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}

.data-panel {
  background: rgba(0, 0, 0, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 20px;
  backdrop-filter: blur(16px);
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #22C55E;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.7);
}

.status-badge {
  border-radius: 9999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

---

# 21. Do's and Don'ts

## Do

- Prioritize score readability.
- Show live status clearly.
- Keep public table stable and scannable.
- Use glass surfaces consistently.
- Keep the background subtle.
- Make admin actions auditable.
- Show scoring breakdowns in admin detail.
- Preserve trace visibility for debugging and evaluation.

## Don't

- Do not make the leaderboard look like a generic SaaS table.
- Do not overload public view with raw trace details.
- Do not animate everything.
- Do not hide failed runs in admin.
- Do not delete audit history silently.
- Do not use low-contrast gray for important metrics.
- Do not rely on WebGL for core usability.

---

# 22. Acceptance Criteria

The design is considered successful when:

- A student can identify the top 3 teams from across the room.
- A lecturer can explain why a team is ranked highly using visible score breakdowns.
- An admin can find, inspect, invalidate, restore, or delete a run safely.
- The public board still works if live connection temporarily fails.
- The interface communicates HPC telemetry, not only ranking.
- Dense data remains readable despite the glass/HUD style.
