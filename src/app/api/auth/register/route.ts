import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, createSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email: string; password: string };

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Valid email and password (min 8 chars) required" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const existing = await db
    .prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();

  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const password_hash = await hashPassword(password);
  const result = await db
    .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
    .bind(email, password_hash)
    .run();

  const token = await createSession({
    userId: result.meta.last_row_id as number,
    email,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
