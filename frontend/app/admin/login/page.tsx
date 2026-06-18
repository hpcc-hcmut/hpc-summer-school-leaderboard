"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "@/lib/api";
import { Lock, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await adminLogin(password);
      if (result.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error ?? "Invalid password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-4)", position: "relative", overflow: "hidden" }}>
      {/* Background Glows for depth and contrast */}
      <div style={{
        position: "absolute",
        width: 350,
        height: 350,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(75, 75, 160, 0.2) 0%, transparent 70%)",
        filter: "blur(60px)",
        top: "20%",
        left: "30%",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(143, 71, 174, 0.15) 0%, transparent 70%)",
        filter: "blur(50px)",
        bottom: "20%",
        right: "30%",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div className="gradient-shell" style={{ width: "100%", maxWidth: 420, zIndex: 1, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 50px rgba(75, 75, 160, 0.15)" }}>
        <div className="inner" style={{ padding: "var(--spacing-8)", display: "flex", flexDirection: "column", gap: "var(--spacing-6)", background: "linear-gradient(135deg, rgba(20, 20, 35, 0.85) 0%, rgba(10, 10, 20, 0.95) 100%)", borderRadius: "19px" }}>
          
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: "var(--spacing-4)", borderRadius: "50%", background: "rgba(143, 71, 174, 0.15)", border: "1px solid rgba(143, 71, 174, 0.3)", marginBottom: "var(--spacing-4)", boxShadow: "0 0 15px rgba(143, 71, 174, 0.2)" }}>
              <Lock size={32} style={{ color: "#c084fc" }} />
            </div>
            <h1 className="text-display" style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #FFFFFF 0%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "var(--spacing-2)"
            }}>Admin Console</h1>
            <p className="text-subtitle" style={{ color: "#a1a1aa", fontSize: 14 }}>HPC Summer School Mini Hackathon</p>
          </div>

          {error && (
            <div style={{ padding: "var(--spacing-3)", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-card)", color: "var(--danger)", fontSize: 14, textAlign: "center", fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
              <label className="text-utility" htmlFor="password-input" style={{ color: "#e4e4e7", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>Master Password</label>
              <input
                id="password-input"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                required
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontSize: 16
                }}
              />
            </div>
            <button
              type="submit"
              className="btn"
              id="login-submit-btn"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: 15,
                fontWeight: 700,
                color: "#ffffff",
                background: "linear-gradient(135deg, #4B4BA0 0%, #8F47AE 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 15px rgba(75, 75, 160, 0.35)",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Authenticating…" : "Access Control"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "var(--spacing-4)" }}>
            <Link
              href="/"
              className="btn btn-ghost"
              style={{
                width: "100%",
                color: "#e4e4e7",
                borderColor: "rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.02)"
              }}
              id="back-to-leaderboard-btn"
            >
              <ArrowLeft size={16} /> Return to Leaderboard
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
