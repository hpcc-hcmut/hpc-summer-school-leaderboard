"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "@/lib/api";

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
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-icon">🔐</div>
        <div className="login-title">Admin Access</div>
        <div className="login-subtitle">
          Enter the admin password to access the dashboard
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
              PASSWORD
            </label>
            <input
              id="password-input"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            id="login-submit-btn"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                Authenticating…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link
            href="/"
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "center" }}
            id="back-to-leaderboard-btn"
          >
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
