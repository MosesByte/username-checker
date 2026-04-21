import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);

export interface SessionPayload {
  userId: number;
  email: string;
  username?: string | null;
  name?: string | null;
  role?: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      username: payload.username as string | null | undefined,
      name: payload.name as string | null | undefined,
      role: payload.role as string | undefined,
    };
  } catch {
    return null;
  }
}
