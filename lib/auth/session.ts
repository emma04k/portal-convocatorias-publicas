import { prisma } from "@/lib/db/prisma";
import { verifyAuthToken } from "@/lib/auth/jwt";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
};

export const AUTH_COOKIE_NAME = "auth_token";

export function toSafeUser(user: { id: string; name: string; email: string }): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function createAuthCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 7}${secure}`;
}

export function createLogoutCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`;
}

export function readBearerOrCookieToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  const cookie = request.headers.get("cookie");
  if (!cookie) {
    return null;
  }

  const authCookie = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));

  return authCookie ? decodeURIComponent(authCookie.slice(AUTH_COOKIE_NAME.length + 1)) : null;
}

export async function getCurrentUser(request: Request): Promise<SafeUser | null> {
  const token = readBearerOrCookieToken(request);
  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  return user ? toSafeUser(user) : null;
}
