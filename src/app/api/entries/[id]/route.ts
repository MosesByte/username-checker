import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Entry } from "../route";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getEntry(id: string, userId: number): Promise<Entry | null> {
  const db = getDb();
  return (
    db
      .prepare("SELECT * FROM entries WHERE id = ? AND user_id = ?")
      .get(Number(id), userId) as Entry | undefined
  ) ?? null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const entry = await getEntry(id, session.userId);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { platform, username, url, notes } = await req.json();

  const db = getDb();
  db.prepare(
    `UPDATE entries
     SET platform = ?, username = ?, url = ?, notes = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    platform?.trim() ?? entry.platform,
    username?.trim() ?? entry.username,
    url?.trim() ?? entry.url,
    notes?.trim() ?? entry.notes,
    Number(id)
  );

  const updated = db.prepare("SELECT * FROM entries WHERE id = ?").get(Number(id)) as Entry;
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const entry = await getEntry(id, session.userId);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  getDb().prepare("DELETE FROM entries WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
