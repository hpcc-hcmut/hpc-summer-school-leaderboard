"use client";
import { useEffect, useState } from "react";
import type { RunDetail } from "@/lib/types";
import { fetchRun } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/format";
import { X, Clock, Activity, FileText, Bot, HelpCircle } from "lucide-react";

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
                {run.final_score !== undefined && run.qa_score !== undefined ? (
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "var(--spacing-6)", marginBottom: "var(--spacing-4)" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-2)" }}>
                      <span className="text-display" style={{ color: "var(--tertiary)", fontSize: 32 }}>{run.score.toFixed(1)}</span>
                      <span className="text-utility text-muted">Final Score</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-1)" }}>
                      <span className="text-subtitle text-secondary" style={{ fontSize: 13 }}>QA Score:</span>
                      <span className="text-mono text-primary" style={{ fontWeight: 600, fontSize: 14 }}>{run.qa_score.toFixed(1)}/40.0</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-1)" }}>
                      <span className="text-subtitle text-secondary" style={{ fontSize: 13 }}>Legacy Score:</span>
                      <span className="text-mono text-secondary" style={{ fontWeight: 600, fontSize: 14 }}>{run.legacy_score?.toFixed(1)}/100.0</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-2)", marginBottom: "var(--spacing-4)" }}>
                    <span className="text-display" style={{ color: "var(--tertiary)" }}>{run.score.toFixed(1)}</span>
                    <span className="text-utility text-muted">Total Score</span>
                  </div>
                )}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                  {(run.final_score !== undefined && run.qa_score !== undefined
                    ? [
                        { label: "QA Correctness", val: run.qa_score, max: 40, color: "var(--success)" },
                        { label: "Summary & Resource", val: (run.breakdown.correctness * 25.0) / 40.0, max: 25, color: "var(--tertiary)" },
                        { label: "Evidence Quality", val: (run.breakdown.evidence * 15.0) / 25.0, max: 15, color: "var(--info)" },
                        { label: "Workflow Design", val: (run.breakdown.workflow * 12.0) / 20.0, max: 12, color: "var(--primary)" },
                        { label: "HPC Efficiency", val: (run.breakdown.efficiency * 8.0) / 15.0, max: 8, color: "var(--success)" },
                      ]
                    : [
                        { label: "Correctness", val: run.breakdown.correctness, max: 40, color: "var(--success)" },
                        { label: "Evidence", val: run.breakdown.evidence, max: 25, color: "var(--tertiary)" },
                        { label: "Workflow", val: run.breakdown.workflow, max: 20, color: "var(--info)" },
                        { label: "Efficiency", val: run.breakdown.efficiency, max: 15, color: "var(--primary)" }
                      ]
                  ).map(b => (
                    <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)" }}>
                      <span className="text-subtitle text-secondary" style={{ width: 140 }}>{b.label}</span>
                      <div style={{ flex: 1, height: 6, background: "var(--border-subtle)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: b.color, width: `${(b.val / b.max) * 100}%` }} />
                      </div>
                      <span className="text-mono" style={{ width: 50, textAlign: "right" }}>{b.val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* QA Question Details */}
            {run.qa_details && run.qa_details.length > 0 && (
              <section>
                <h3 className="text-utility text-primary" style={{ marginBottom: "var(--spacing-4)", display: "flex", alignItems: "center", gap: 6 }}>
                  <HelpCircle size={16} /> QA Question Details
                </h3>
                <div className="glass-card" style={{ padding: "var(--spacing-4)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "70px 120px 100px 100px 1fr", gap: "var(--spacing-2)", paddingBottom: "var(--spacing-2)", borderBottom: "1px solid var(--border-subtle)", opacity: 0.7 }} className="text-utility">
                    <div>QID</div>
                    <div>Score</div>
                    <div style={{ textAlign: "center" }}>Answer</div>
                    <div style={{ textAlign: "center" }}>Evidence</div>
                    <div>Details</div>
                  </div>
                  {run.qa_details.map(q => (
                    <div key={q.question_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", padding: "var(--spacing-3) 0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "70px 120px 100px 100px 1fr", gap: "var(--spacing-2)", alignItems: "center" }} className="text-mono">
                        <span style={{ fontWeight: 600, color: "var(--primary)" }}>{q.question_id}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ minWidth: 70, textAlign: "right", fontSize: 12 }}>{q.score.toFixed(2)} / {q.max_score.toFixed(1)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <span className={`badge badge-${q.answer_ok ? "success" : "danger"}`} style={{ fontSize: 10, padding: "2px 6px", width: 75, textAlign: "center" }}>
                            {q.answer_ok ? "CORRECT" : "INCORRECT"}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <span className={`badge badge-${q.evidence_ok ? "success" : "danger"}`} style={{ fontSize: 10, padding: "2px 6px", width: 75, textAlign: "center" }}>
                            {q.evidence_ok ? "CITED" : "MISSING"}
                          </span>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--text-secondary)" }}>
                          {q.required_evidence_files.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                              <span style={{ opacity: 0.7, minWidth: 70 }}>Required:</span>
                              {q.required_evidence_files.map(f => (
                                <span key={f} className="text-mono" style={{ background: "rgba(255,255,255,0.05)", padding: "1px 4px", borderRadius: 2 }}>{f.split("/").pop()}</span>
                              ))}
                            </div>
                          )}
                          {q.submitted_evidence_files.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                              <span style={{ opacity: 0.7, minWidth: 70 }}>Submitted:</span>
                              {q.submitted_evidence_files.map(f => {
                                const base = f.split("/").pop();
                                const isCorrect = q.required_evidence_files.includes(f) || q.required_evidence_files.some(rf => rf.endsWith(f) || f.endsWith(rf));
                                return (
                                  <span key={f} className="text-mono" style={{ background: "rgba(255,255,255,0.05)", padding: "1px 4px", borderRadius: 2, color: isCorrect ? "var(--success)" : "var(--text-muted)" }}>{base}</span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
