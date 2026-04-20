import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface Entry {
  id: number;
  user_id: number;
  platform: string;
  username: string;
  url: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const db = await getDb();
  const { results } = await db
    .prepare("SELECT * FROM entries WHERE user_id = ? ORDER BY platform, username")
    .bind(session.userId)
    .all<Entry>();

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { platform, username, url, notes } = await req.json() as { platform: string; username: string; url: string; notes?: string };

  if (!platform || !username || !url) {
    return NextResponse.json(
      { error: "platform, username, and url are required" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const result = await db
    .prepare(
      "INSERT INTO entries (user_id, platform, username, url, notes) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(session.userId, platform.trim(), username.trim(), url.trim(), notes?.trim() ?? null)
    .run();

  const entry = await db
    .prepare("SELECT * FROM entries WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first<Entry>();

  return NextResponse.json(entry, { status: 201 });
}
