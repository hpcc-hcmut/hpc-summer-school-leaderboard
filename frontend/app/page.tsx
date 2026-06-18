import { cookies } from "next/headers";
import Link from "next/link";
import type { LeaderboardData } from "@/lib/types";
import LeaderboardTable from "@/components/LeaderboardTable";
import AdminLoginButton from "@/components/AdminLoginButton";
import { formatDate } from "@/lib/format";

async function getLeaderboard(): Promise<LeaderboardData | null> {
  const backend = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${backend}/api/leaderboard`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_CLASS = ["rank-1", "rank-2", "rank-3"];

export default async function HomePage() {
  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get("admin_token");
  const data = await getLeaderboard();

  const teams = data?.teams ?? [];
  const podiumTeams = teams.slice(0, 3);
  const tableTeams = teams;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo" style={{ textDecoration: "none" }}>
            <span className="school">HCMUT · HPC Summer School</span>
            <span className="title">Mini Hackathon Leaderboard</span>
          </Link>
          <div className="navbar-right">
            <div className="live-badge">
              <span className="live-dot" />
              Live
            </div>
            <AdminLoginButton isAdmin={isAdmin} />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container">
        {/* Hero */}
        <div className="page-hero">
          <span className="event-tag">🏆 Hackathon 2025</span>
          <h1>Team Rankings</h1>
          <p className="subtitle">
            Real-time standings · Updated automatically · Score = Correctness + Evidence + Workflow + Efficiency
          </p>
          {data && (
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Last updated: {formatDate(data.updated_at)}
            </p>
          )}
        </div>

        {/* Podium */}
        {podiumTeams.length > 0 && (
          <div className="podium">
            {podiumTeams.map((team, idx) => (
              <div
                key={team.team_id}
                className={`podium-card ${RANK_CLASS[idx]}`}
              >
                <span className="podium-medal">{MEDALS[idx]}</span>
                <div className="podium-rank">#{team.rank}</div>
                <div className="podium-team">{team.team_name}</div>
                <div className="podium-score">{team.best_score.toFixed(1)}</div>
                <div className="podium-breakdown">
                  <span className="breakdown-chip">C {team.correctness.toFixed(0)}</span>
                  <span className="breakdown-chip">E {team.evidence.toFixed(0)}</span>
                  <span className="breakdown-chip">W {team.workflow.toFixed(0)}</span>
                  <span className="breakdown-chip">F {team.efficiency.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full leaderboard table */}
        <div className="leaderboard-section">
          <div className="section-header">
            <div className="section-title">
              <span>📊</span>
              Full Standings
              {teams.length > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: "var(--text-muted)",
                  }}
                >
                  {teams.length} teams
                </span>
              )}
            </div>
            <div className="refresh-info">
              <span>⏱</span>
              Auto-refreshes every 30s
            </div>
          </div>

          {data === null ? (
            <div className="empty-state">
              <div className="icon">⚠️</div>
              <p>Unable to reach backend. Please try again later.</p>
            </div>
          ) : (
            <LeaderboardTable teams={tableTeams} />
          )}
        </div>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            padding: "32px 0",
            fontSize: 12,
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border)",
            marginTop: 8,
          }}
        >
          HCMUT HPC Summer School · Mini Hackathon 2025 · Built with Next.js 15
        </footer>
      </main>

      {/* Auto-refresh script */}
      <AutoRefresh />
    </>
  );
}

function AutoRefresh() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          setTimeout(function() { window.location.reload(); }, 30000);
        `,
      }}
    />
  );
}
