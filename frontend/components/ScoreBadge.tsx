"use client";
import { scoreGrade } from "@/lib/format";

export default function ScoreBadge({ score }: { score: number }) {
  const grade = scoreGrade(score);
  return (
    <span className={`score-badge grade-${grade}`}>
      {score.toFixed(1)}
      <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 2 }}>{grade}</span>
    </span>
  );
}
