import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminRunsTable from "@/components/AdminRunsTable";
import LogoutButton from "./LogoutButton";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");

  if (!token) {
    redirect("/admin/login");
  }

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo" style={{ textDecoration: "none" }}>
            <span className="school">HCMUT · HPC Summer School</span>
            <span className="title">Admin Dashboard</span>
          </Link>
          <div className="navbar-right">
            <Link href="/" className="btn btn-ghost" id="view-leaderboard-btn">
              📊 Leaderboard
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="admin-header">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 14px",
              background: "rgba(124, 58, 237, 0.15)",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              color: "#a78bfa",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            <span>⚙️</span> Admin Mode
          </div>
          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 36px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              background:
                "linear-gradient(135deg, var(--text-primary) 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 6,
            }}
          >
            Submission Management
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            View, delete, and restore hackathon submissions. Deleted entries are
            hidden from the public leaderboard.
          </p>
        </div>

        <AdminRunsTable />

        <footer
          style={{
            textAlign: "center",
            padding: "32px 0",
            fontSize: 12,
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border)",
            marginTop: 32,
          }}
        >
          HCMUT HPC Summer School · Admin Panel · Session expires in 12 hours
        </footer>
      </main>
    </>
  );
}
