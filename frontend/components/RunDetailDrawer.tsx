"use client";
import { useEffect, useState } from "react";
import type { RunDetail } from "@/lib/types";
import { fetchRun } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/format";
import { X, Clock, Activity, FileText, Bot } from "lucide-react";

export default function RunDetailDrawer({ submissionId, onClose }: { submissionId: number; onClose: () => void; }) {
  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRun(submissionId).then(setRun).finally(() => setLoading(false));
  }, [submissionId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" style={{ width: "min(800px, 100vw)", backgroundColor: "var(--surface)" }}>
        
        <div style={{ padding: "var(--spacing-6)", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--surface)", zIndex: 10 }}>
          <div>
            <div className="text-title" style={{ fontSize: 20 }}>Run #{submissionId}</div>
            {run && <div className="text-utility text-muted" style={{ marginTop: 4 }}>{run.team_name} · {formatDate(run.created_at)}</div>}
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 8 }}><X size={20} /></button>
        </div>

        {loading ? (
          <div style={{ padding: "var(--spacing-12)", textAlign: "center" }}><div className="spinner" /></div>
        ) : run ? (
          <div style={{ padding: "var(--spacing-6)", display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
            
            {/* Score Breakdown */}
            <section>
              <h3 className="text-utility text-primary" style={{ marginBottom: "var(--spacing-4)", display: "flex", alignItems: "center", gap: 6 }}><Activity size={16} /> Score Breakdown</h3>
              <div className="data-panel" style={{ padding: "var(--spacing-4)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-2)", marginBottom: "var(--spacing-4)" }}>
                  <span className="text-display" style={{ color: "var(--tertiary)" }}>{run.score.toFixed(1)}</span>
                  <span className="text-utility text-muted">Total Score</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                  {[
                    { label: "Correctness", val: run.breakdown.correctness, max: 40, color: "var(--success)" },
                    { label: "Evidence", val: run.breakdown.evidence, max: 25, color: "var(--tertiary)" },
                    { label: "Workflow", val: run.breakdown.workflow, max: 20, color: "var(--info)" },
                    { label: "Efficiency", val: run.breakdown.efficiency, max: 15, color: "var(--primary)" }
                  ].map(b => (
                    <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)" }}>
                      <span className="text-subtitle text-secondary" style={{ width: 100 }}>{b.label}</span>
                      <div style={{ flex: 1, height: 6, background: "var(--border-subtle)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: b.color, width: `${(b.val / b.max) * 100}%` }} />
                      </div>
                      <span className="text-mono" style={{ width: 40, textAlign: "right" }}>{b.val.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Trace Summary */}
            <section>
              <h3 className="text-utility text-primary" style={{ marginBottom: "var(--spacing-4)", display: "flex", alignItems: "center", gap: 6 }}><Clock size={16} /> Trace Timeline</h3>
              <div className="glass-card" style={{ padding: "var(--spacing-4)", overflowX: "auto" }}>
                <pre className="text-mono text-secondary" style={{ fontSize: 12 }}>
                  {JSON.stringify(run.trace_summary, null, 2)}
                </pre>
              </div>
            </section>

            {/* Workflow Metadata */}
            <section>
              <h3 className="text-utility text-primary" style={{ marginBottom: "var(--spacing-4)", display: "flex", alignItems: "center", gap: 6 }}><Bot size={16} /> Workflow Metadata</h3>
              <div className="glass-card" style={{ padding: "var(--spacing-4)", overflowX: "auto" }}>
                <pre className="text-mono text-secondary" style={{ fontSize: 12 }}>
                  {JSON.stringify(run.workflow_metadata, null, 2)}
                </pre>
              </div>
            </section>

            {/* Raw Answer */}
            <section>
              <h3 className="text-utility text-primary" style={{ marginBottom: "var(--spacing-4)", display: "flex", alignItems: "center", gap: 6 }}><FileText size={16} /> Raw Answer</h3>
              <div className="glass-card" style={{ padding: "var(--spacing-4)", overflowX: "auto" }}>
                <pre className="text-mono text-secondary" style={{ fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {JSON.stringify(run.answer, null, 2)}
                </pre>
              </div>
            </section>

            {/* Scoring Messages */}
            <section>
              <h3 className="text-utility text-primary" style={{ marginBottom: "var(--spacing-4)" }}>Evaluator Logs</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                {run.messages.map((m, i) => (
                  <div key={i} style={{ padding: "var(--spacing-2) var(--spacing-3)", background: "rgba(255,255,255,0.05)", borderLeft: "2px solid var(--tertiary)", fontSize: 13, color: "var(--text-secondary)" }}>
                    {m}
                  </div>
                ))}
              </div>
            </section>

          </div>
        ) : (
          <div style={{ padding: "var(--spacing-12)", textAlign: "center" }} className="text-secondary">Run not found</div>
        )}
      </div>
    </>
  );
}
