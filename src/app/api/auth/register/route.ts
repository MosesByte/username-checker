import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, createSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, name, email, password, inviteCode } = await req.json() as {
      username: string;
      name?: string;
      email?: string;
      password: string;
      inviteCode: string;
    };
    const normalizedUsername = username?.trim().toLowerCase();
    const normalizedName = name?.trim() || null;
    const normalizedEmail = email?.trim().toLowerCase() || `${normalizedUsername}@local.user`;
    const normalizedCode = inviteCode?.trim();

    if (!normalizedUsername || !password || password.length < 8 || !normalizedCode) {
      return NextResponse.json(
        { error: "Username, invite code and password (min 8 chars) required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existing = await db
      .prepare("SELECT id FROM users WHERE email = ? OR username = ?")
      .bind(normalizedEmail, normalizedUsername)
      .first();

    if (existing) {
      return NextResponse.json({ error: "Username or email already registered" }, { status: 409 });
    }

    const invite = await db
      .prepare("SELECT id FROM invite_codes WHERE code = ? AND used_at IS NULL")
      .bind(normalizedCode)
      .first<{ id: number }>();

    if (!invite) {
      return NextResponse.json({ error: "Invalid or already used invite code" }, { status: 403 });
    }

    const password_hash = await hashPassword(password);
    const result = await db
      .prepare("INSERT INTO users (email, username, name, password_hash, role) VALUES (?, ?, ?, ?, 'user')")
      .bind(normalizedEmail, normalizedUsername, normalizedName, password_hash)
      .run();
    const userId = result.meta.last_row_id as number;

    await db
      .prepare("UPDATE invite_codes SET used_by = ?, used_at = datetime('now') WHERE id = ?")
      .bind(userId, invite.id)
      .run();

    const token = await createSession({
      userId,
      email: normalizedEmail,
      username: normalizedUsername,
      name: normalizedName,
      role: "user",
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
