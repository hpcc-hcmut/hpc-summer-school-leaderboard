export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#00e5a0";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export function scoreGrade(score: number): string {
  if (score >= 80) return "S";
  if (score >= 65) return "A";
  if (score >= 50) return "B";
  if (score >= 35) return "C";
  return "D";
}

export function truncateModels(models: string[], max = 2): string {
  if (!models || models.length === 0) return "—";
  const shown = models.slice(0, max).join(", ");
  if (models.length > max) return `${shown} +${models.length - max}`;
  return shown;
}
