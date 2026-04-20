import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Entry } from "../route";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const db = await getDb();

  const entry = await db
    .prepare("SELECT * FROM entries WHERE id = ? AND user_id = ?")
    .bind(Number(id), session.userId)
    .first<Entry>();

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { platform, username, url, notes } = await req.json() as { platform?: string; username?: string; url?: string; notes?: string };

  await db
    .prepare(
      `UPDATE entries
       SET platform = ?, username = ?, url = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      platform?.trim() ?? entry.platform,
      username?.trim() ?? entry.username,
      url?.trim() ?? entry.url,
      notes?.trim() ?? entry.notes,
      Number(id)
    )
    .run();

  const updated = await db
    .prepare("SELECT * FROM entries WHERE id = ?")
    .bind(Number(id))
    .first<Entry>();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const db = await getDb();

  const entry = await db
    .prepare("SELECT id FROM entries WHERE id = ? AND user_id = ?")
    .bind(Number(id), session.userId)
    .first();

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.prepare("DELETE FROM entries WHERE id = ?").bind(Number(id)).run();
  return NextResponse.json({ ok: true });
}
