"use client";
import { useRouter } from "next/navigation";
import { adminLogout } from "@/lib/api";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await adminLogout();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      className="btn btn-ghost"
      onClick={handleLogout}
      id="logout-btn"
    >
      🚪 Logout
    </button>
  );
}
