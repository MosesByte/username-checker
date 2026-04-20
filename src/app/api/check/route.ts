import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

type CheckResult = "taken" | "available" | "unknown";

const PLATFORMS: Record<string, (username: string) => string> = {
  "guns.lol": (u) => `https://guns.lol/${u}`,
  "fakecrime.bio": (u) => `https://fakecrime.bio/${u}`,
};

async function checkPlatform(platform: string, username: string): Promise<CheckResult> {
  const urlFn = PLATFORMS[platform];
  if (!urlFn) return "unknown";

  try {
    const res = await fetch(urlFn(username), {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) return "available";
    if (res.status === 200) return "taken";
    return "unknown";
  } catch {
    return "unknown";
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  const { username, platforms } = (await req.json()) as {
    username: string;
    platforms: string[];
  };

  if (!username || !Array.isArray(platforms) || platforms.length === 0) {
    return NextResponse.json({ error: "username and platforms required" }, { status: 400 });
  }

  const validPlatforms = platforms.filter((p) => p in PLATFORMS);
  if (validPlatforms.length === 0) {
    return NextResponse.json({ error: "No valid platforms specified" }, { status: 400 });
  }

  const results = await Promise.all(
    validPlatforms.map(async (platform) => ({
      platform,
      result: await checkPlatform(platform, username.trim()),
    }))
  );

  if (session) {
    const db = await getDb();
    await Promise.all(
      results.map(({ platform, result }) =>
        db
          .prepare(
            "INSERT INTO username_checks (user_id, platform, username, result) VALUES (?, ?, ?, ?)"
          )
          .bind(session.userId, platform, username.trim(), result)
          .run()
      )
    );
  }

  return NextResponse.json({ username, results });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const { results } = await db
    .prepare(
      "SELECT * FROM username_checks WHERE user_id = ? ORDER BY checked_at DESC LIMIT 50"
    )
    .bind(session.userId)
    .all();

  return NextResponse.json(results);
}
