import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface InviteCode {
  id: number;
  code: string;
  created_by: number | null;
  used_by: number | null;
  created_at: string;
  used_at: string | null;
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
  return { db, session };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { results } = await auth.db
    .prepare("SELECT * FROM invite_codes ORDER BY created_at DESC LIMIT 100")
    .all<InviteCode>();

  return NextResponse.json(results);
}

export async function POST() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const code = createInviteCode();
  await auth.db
    .prepare("INSERT INTO invite_codes (code, created_by) VALUES (?, ?)")
    .bind(code, auth.session.userId)
    .run();

  const invite = await auth.db
    .prepare("SELECT * FROM invite_codes WHERE code = ?")
    .bind(code)
    .first<InviteCode>();

  return NextResponse.json(invite, { status: 201 });
}

function createInviteCode() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .match(/.{1,6}/g)!
    .join("-")
    .toUpperCase();
}
