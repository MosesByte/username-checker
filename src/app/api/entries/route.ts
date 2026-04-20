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

  const db = getDb();
  const entries = db
    .prepare("SELECT * FROM entries WHERE user_id = ? ORDER BY platform, username")
    .all(session.userId) as Entry[];

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { platform, username, url, notes } = await req.json();

  if (!platform || !username || !url) {
    return NextResponse.json({ error: "platform, username, and url are required" }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO entries (user_id, platform, username, url, notes) VALUES (?, ?, ?, ?, ?)"
    )
    .run(session.userId, platform.trim(), username.trim(), url.trim(), notes?.trim() ?? null);

  const entry = db
    .prepare("SELECT * FROM entries WHERE id = ?")
    .get(result.lastInsertRowid) as Entry;

  return NextResponse.json(entry, { status: 201 });
}
