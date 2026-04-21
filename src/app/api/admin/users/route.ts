import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface AdminUser {
  id: number;
  email: string;
  username: string | null;
  role: string;
  created_at: string;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;

  const db = await getDb();
  const user = await db
    .prepare("SELECT role FROM users WHERE id = ?")
    .bind(session.userId)
    .first<{ role: string }>();

  if (user?.role !== "admin") return null;
  return { db };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { results } = await auth.db
    .prepare(
      "SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC LIMIT 500"
    )
    .all<AdminUser>();

  return NextResponse.json(results);
}
