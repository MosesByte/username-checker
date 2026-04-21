import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

type CheckResult = "taken" | "available" | "unknown";

type MarkerSource = string[] | ((username: string) => string[]);

interface PlatformConfig {
  url: (username: string) => string;
  // Any of these strings in the response body means the username is free.
  availableMarkers?: MarkerSource;
  // Any of these strings in the response body means the username is taken.
  takenMarkers?: MarkerSource;
  // Any of these strings in the response body means the fetch hit an anti-bot/parking page.
  unknownMarkers?: MarkerSource;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  "fakecrime.bio": {
    url: (u) => `https://fakecrime.bio/${u}`,
  },
  "cutz.lol": {
    url: (u) => `https://cutz.lol/${u}`,
    takenMarkers: (u) => [
      `<title>${u.toLowerCase()} | cutz.lol</title>`,
      `property="og:title" content="${u.toLowerCase()}"`,
    ],
  },
  "frozi.lol": {
    url: (u) => `https://frozi.lol/${u}`,
    takenMarkers: (u) => [
      `<title>${u.toLowerCase()} // frozi.lol</title>`,
      `property="og:title" content="${u.toLowerCase()} // frozi.lol"`,
    ],
    availableMarkers: [
      "<title>no profile found</title>",
      "this username is not registered on frozi.lol",
    ],
  },
  "ysn.lol": {
    url: (u) => `https://ysn.lol/${u}`,
    takenMarkers: (u) => [
      `(@${u.toLowerCase()})`,
      `property="og:type" content="profile"`,
      `"initialprofile":{"status":200`,
    ],
    availableMarkers: [
      "<title>not found</title>",
      "<title>not found",
      `"initialprofile":{"status":404`,
    ],
  },
  "haunt.gg": {
    url: (u) => `https://haunt.gg/${u}`,
  },
  "linktr.ee": {
    url: (u) => `https://linktr.ee/${u}`,
  },
  "emogir.ls": {
    url: (u) => `https://emogir.ls/${u}`,
    takenMarkers: (u) => [
      `<title>@${u.toLowerCase()} | emogir.ls</title>`,
      `property="og:title" content="@${u.toLowerCase()} | emogir.ls"`,
      `property="og:type" content="profile"`,
    ],
    availableMarkers: [
      "<title>emogir.ls - build your perfect profile</title>",
      "create a unique identity that represents you across the web. reserve your username",
      "404: this page could not be found.",
    ],
  },
  "feds.lol": {
    url: (u) => `https://feds.lol/${u}`,
    takenMarkers: [
      `"config":{"id":`,
      `"showEnterscreen":true`,
      "UID ",
    ],
    availableMarkers: [
      "NEXT_HTTP_ERROR_FALLBACK;404",
      "page not found",
      "the page you’re looking for doesn’t exist or has moved.",
    ],
  },
  "makka.lol": {
    url: (u) => `https://makka.lol/api/profile/${u}`,
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

      const takenMarkers = resolveMarkers(config.takenMarkers, username);
      if (takenMarkers.some((marker) => text.includes(marker.toLowerCase()))) {
        return "taken";
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
