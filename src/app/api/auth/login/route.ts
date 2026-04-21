import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, createSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, identifier, password } = await req.json() as {
    email?: string;
    identifier?: string;
    password: string;
  };
  const login = (identifier ?? email ?? "").trim();

  if (!login || !password) {
    return NextResponse.json({ error: "Username/email and password required" }, { status: 400 });
  }

  const db = await getDb();
  const user = await db
    .prepare("SELECT id, email, username, role, password_hash FROM users WHERE email = ? OR username = ?")
    .bind(login, login)
    .first<{
      id: number;
      email: string;
      username: string | null;
      role: string;
      password_hash: string;
    }>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSession({
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
