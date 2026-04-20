import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

type CheckResult = "taken" | "available" | "unknown";

type MarkerSource = string[] | ((username: string) => string[]);

interface PlatformConfig {
  url: (username: string) => string;
  // Any of these strings in the response body means the username is free.
  availableMarkers?: MarkerSource;
  // Any of these strings in the response body means the fetch hit an anti-bot/parking page.
  unknownMarkers?: MarkerSource;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  "guns.lol": {
    url: (u) => `https://guns.lol/${u}`,
    availableMarkers: [
      "claim your username",       // English
      "benutzername nicht gefunden", // German
      "username not found",
    ],
  },
  "fakecrime.bio": {
    url: (u) => `https://fakecrime.bio/${u}`,
  },
  "ysn.lol": {
    url: (u) => `https://ysn.lol/${u}`,
    availableMarkers: [
      "<title>not found</title>",
      "username not found",
      "this username is available",
    ],
  },
  "haunt.gg": {
    url: (u) => `https://haunt.gg/${u}`,
  },
  "emogir.ls": {
    url: (u) => `https://emogir.ls/${u}`,
    availableMarkers: [
      "<title>emogir.ls - build your perfect profile</title>",
      "create a unique identity that represents you across the web. reserve your username",
      "404: this page could not be found.",
    ],
  },
  "wound.lol": {
    url: (u) => `https://wound.lol/${u}`,
    availableMarkers: [
      "<title>wound - create your perfect bio link page",
      "build your digital identity with style",
      "wound.lol/[input: yourcustomurl]",
    ],
    unknownMarkers: [
      "router.parklogic.com",
      "tenant\":\"namecheap-expired",
      "<title>redirecting...</title>",
    ],
  },
};

function resolveMarkers(markers: MarkerSource | undefined, username: string): string[] {
  if (!markers) return [];
  return typeof markers === "function" ? markers(username) : markers;
}

async function checkPlatform(platform: string, username: string): Promise<CheckResult> {
  const config = PLATFORMS[platform];
  if (!config) return "unknown";

  try {
    const res = await fetch(config.url(username), {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) return "available";

    if (res.status === 200) {
      const text = (await res.text()).toLowerCase();
      const unknownMarkers = resolveMarkers(config.unknownMarkers, username);
      if (unknownMarkers.some((marker) => text.includes(marker.toLowerCase()))) {
        return "unknown";
      }

      const availableMarkers = resolveMarkers(config.availableMarkers, username);
      if (availableMarkers.length) {
        if (availableMarkers.some((marker) => text.includes(marker.toLowerCase()))) {
          return "available";
        }
      }
      return "taken";
    }

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
