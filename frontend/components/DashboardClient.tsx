"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { LeaderboardData } from "@/lib/types";
import LeaderboardTable from "@/components/LeaderboardTable";
import AdminLoginButton from "@/components/AdminLoginButton";
import HeroLeaderCard from "@/components/HeroLeaderCard";
import { formatDate } from "@/lib/format";
import ClusterStateSphereClient from "@/components/telemetry/ClusterStateSphereClient";

type Props = {
  initialData: LeaderboardData | null;
  isAdmin: boolean;
};

export default function DashboardClient({ initialData, isAdmin }: Props) {
  const [data, setData] = useState<LeaderboardData | null>(initialData);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) return;
        const nextData = await res.json();
        if (mounted) {
          setData(nextData);
        }
      } catch (err) {
        console.error("Failed to poll leaderboard data:", err);
      }
    }

    // Poll every 5 seconds
    const intervalId = setInterval(load, 5000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const teams = data?.teams ?? [];
  const topTeam = teams.length > 0 ? teams[0] : null;

  return (
    <>
      {/* Top Status Bar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid var(--border-default)", backdropFilter: "blur(24px)", backgroundColor: "rgba(0,0,0,0.4)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
            <Image src="/logos/hcmut-hpc-school-logo-final.png" alt="HPC School Logo" width={120} height={40} priority />
            <div style={{ width: 1, height: 24, backgroundColor: "var(--border-default)", marginLeft: "var(--spacing-1)", marginRight: "var(--spacing-1)" }} />
            <span className="text-title" style={{ fontSize: 18, fontWeight: 600 }}>Mini Hackathon Leaderboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)" }}>
            <div className="badge badge-success">
              <span className="pulse-dot" style={{ backgroundColor: "var(--success)" }} /> LIVE
            </div>
            {data && <span className="text-utility text-muted">Updated: {formatDate(data.updated_at)}</span>}
            <AdminLoginButton isAdmin={isAdmin} />
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <main className="container" style={{ paddingTop: "var(--spacing-8)", paddingBottom: "var(--spacing-12)" }}>
        
        {/* Hero Leader Card */}
        {topTeam && <HeroLeaderCard team={topTeam} />}

        {/* Dashboard Grid */}
        <div className="dashboard-grid animate-fade-in">
          {/* Left: Leaderboard Table */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <LeaderboardTable teams={teams} />
          </div>

          {/* Right: Telemetry Sphere */}
          <div>
            <ClusterStateSphereClient
              data={
                data?.sphere ?? {
                  runningJobs: 0,
                  pendingJobs: 0,
                  completedRuns: 0,
                  failedRuns: 0,
                  teams: [],
                }
              }
            />
          </div>
        </div>

        {/* Footer */}
        <footer style={{ textAlign: "center", paddingTop: "var(--spacing-8)", marginTop: "var(--spacing-12)", borderTop: "1px solid var(--border-default)" }}>
          <span className="text-utility text-muted">HCMUT HPC Summer School 2026 · Evaluation Engine</span>
        </footer>
      </main>
    </>
  );
}
