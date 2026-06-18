"use client";
import { useEffect, useState } from "react";
import type { RunDetail } from "@/lib/types";
import { fetchRun } from "@/lib/api";
import { formatDate } from "@/lib/format";

const BAR_COLORS: Record<string, string> = {
  Correctness: "linear-gradient(90deg,#60a5fa,#818cf8)",
  Evidence: "linear-gradient(90deg,#a78bfa,#c084fc)",
  Workflow: "linear-gradient(90deg,#00d4ff,#0ea5e9)",
  Efficiency: "linear-gradient(90deg,#00e5a0,#34d399)",
};

const BAR_MAX: Record<string, number> = {
  Correctness: 40,
  Evidence: 25,
  Workflow: 20,
  Efficiency: 15,
};

export default function RunDetailDrawer({
  submissionId,
  onClose,
}: {
  submissionId: number;
  onClose: () => void;
}) {
  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRun(submissionId)
      .then(setRun)
      .finally(() => setLoading(false));
  }, [submissionId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Run detail">
        <div className="drawer-header">
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Run #{submissionId}</div>
            {run && (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {run.team_name} · {formatDate(run.created_at)}
              </div>
            )}
          </div>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            id="close-drawer-btn"
            style={{ padding: "6px 10px" }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div className="spinner" />
          </div>
        ) : run ? (
          <div className="drawer-body">
            {/* Score breakdown */}
            <div>
              <div className="drawer-section-title">Score Breakdown</div>
              {(
                [
                  ["Correctness", run.breakdown.correctness],
                  ["Evidence", run.breakdown.evidence],
                  ["Workflow", run.breakdown.workflow],
                  ["Efficiency", run.breakdown.efficiency],
                ] as [string, number][]
              ).map(([label, val]) => (
                <div className="score-bar-row" key={label}>
                  <div className="score-bar-label">{label}</div>
                  <div className="score-bar-track">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${Math.min((val / BAR_MAX[label]) * 100, 100)}%`,
                        background: BAR_COLORS[label],
                      }}
                    />
                  </div>
                  <div className="score-bar-value">{val.toFixed(1)}</div>
                </div>
              ))}
              <div
                style={{
                  textAlign: "right",
                  fontSize: 20,
                  fontWeight: 900,
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent-cyan)",
                  marginTop: 8,
                }}
              >
                Total: {run.score.toFixed(1)}
              </div>
            </div>

            {/* Messages */}
            <div>
              <div className="drawer-section-title">Scoring Messages</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {run.messages.map((m, i) => (
                  <div className="message-item" key={i}>
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow metadata */}
            <div>
              <div className="drawer-section-title">Workflow Metadata</div>
              <pre className="json-block">
                {JSON.stringify(run.workflow_metadata, null, 2)}
              </pre>
            </div>

            {/* Answer */}
            <div>
              <div className="drawer-section-title">Answer</div>
              <pre className="json-block">
                {JSON.stringify(run.answer, null, 2)}
              </pre>
            </div>

            {/* Trace */}
            <div>
              <div className="drawer-section-title">Trace Summary</div>
              <pre className="json-block">
                {JSON.stringify(run.trace_summary, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">⚠️</div>
            <p>Run not found</p>
          </div>
        )}
      </div>
    </>
  );
}
