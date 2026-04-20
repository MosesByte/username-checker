import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, createSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email: string; password: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const db = await getDb();
  const user = await db
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: number; email: string; password_hash: string }>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSession({ userId: user.id, email: user.email });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
