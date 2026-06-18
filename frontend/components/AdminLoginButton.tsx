"use client";
import Link from "next/link";

export default function AdminLoginButton({ isAdmin }: { isAdmin: boolean }) {
  if (isAdmin) {
    return (
      <Link href="/admin" className="btn btn-ghost" id="admin-dashboard-btn">
        ⚙️ Dashboard
      </Link>
    );
  }
  return (
    <Link href="/admin/login" className="btn btn-ghost" id="admin-login-btn">
      🔒 Admin
    </Link>
  );
}
