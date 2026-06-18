"use client";
import { scoreGrade } from "@/lib/format";

export default function ScoreBadge({ score }: { score: number }) {
  const grade = scoreGrade(score);
  
  // Map old grades to new semantic classes
  const gradeClassMap: Record<string, string> = {
    "S": "badge-success",
    "A": "badge-info",
    "B": "badge-primary",
    "C": "badge-warning",
    "D": "badge-danger"
  };

  const badgeClass = gradeClassMap[grade] || "badge-primary";

  return (
    <span className={`badge ${badgeClass} text-mono`} style={{ fontSize: 14 }}>
      {score.toFixed(1)}
    </span>
  );
}
