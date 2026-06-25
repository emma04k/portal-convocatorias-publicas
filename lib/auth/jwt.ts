import jwt from "jsonwebtoken";

const TOKEN_TTL = "7d";

export type AuthTokenPayload = {
  userId: string;
  email: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export function createAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_TTL });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (typeof payload !== "object" || payload === null) {
      return null;
    }

    const { userId, email } = payload as Partial<AuthTokenPayload>;

    if (typeof userId !== "string" || typeof email !== "string") {
      return null;
    }

    return { userId, email };
  } catch {
    return null;
  }
}
