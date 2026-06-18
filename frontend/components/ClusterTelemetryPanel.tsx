import { Server, Activity, Clock, FileWarning, Cpu, PlayCircle } from "lucide-react";

export default function ClusterTelemetryPanel() {
  // Stubbed data for now
  const telemetry = {
    runningJobs: 6,
    pendingJobs: 3,
    completedRuns: 42,
    failedRuns: 4,
    avgRuntime: 230,
    totalGpuSeconds: 8120,
    mostUsedModel: "qwen2.5-coder:7b"
  };

  return (
    <div className="data-panel" style={{ padding: "var(--spacing-6)", display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", borderBottom: "1px solid var(--border-default)", paddingBottom: "var(--spacing-3)" }}>
        <Server size={18} className="text-primary" />
        <h3 className="text-title" style={{ fontSize: 16, margin: 0 }}>Cluster Telemetry</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)" }}>
        <div className="glass-card" style={{ padding: "var(--spacing-3)" }}>
          <div className="text-utility text-muted" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <PlayCircle size={14} className="text-warning" /> Running
          </div>
          <div className="text-metric" style={{ fontSize: 28, lineHeight: 1 }}>{telemetry.runningJobs}</div>
        </div>

        <div className="glass-card" style={{ padding: "var(--spacing-3)" }}>
          <div className="text-utility text-muted" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Clock size={14} className="text-info" /> Pending
          </div>
          <div className="text-metric" style={{ fontSize: 28, lineHeight: 1 }}>{telemetry.pendingJobs}</div>
        </div>

        <div className="glass-card" style={{ padding: "var(--spacing-3)" }}>
          <div className="text-utility text-muted" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Activity size={14} className="text-success" /> Completed
          </div>
          <div className="text-metric" style={{ fontSize: 28, lineHeight: 1 }}>{telemetry.completedRuns}</div>
        </div>

        <div className="glass-card" style={{ padding: "var(--spacing-3)" }}>
          <div className="text-utility text-muted" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <FileWarning size={14} className="text-danger" /> Failed
          </div>
          <div className="text-metric" style={{ fontSize: 28, lineHeight: 1 }}>{telemetry.failedRuns}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="text-subtitle text-muted" style={{ fontSize: 14 }}>Avg Runtime</span>
          <span className="text-mono" style={{ fontSize: 14 }}>{telemetry.avgRuntime}s</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="text-subtitle text-muted" style={{ fontSize: 14 }}>Total GPU Secs</span>
          <span className="text-mono" style={{ fontSize: 14 }}>{telemetry.totalGpuSeconds}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-default)", paddingTop: "var(--spacing-3)" }}>
          <span className="text-subtitle text-muted" style={{ fontSize: 14 }}>Top Model</span>
          <span className="badge badge-primary text-mono">{telemetry.mostUsedModel}</span>
        </div>
      </div>
    </div>
  );
}
