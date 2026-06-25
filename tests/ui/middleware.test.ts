import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "@/middleware";
import { createAuthToken } from "@/lib/auth/jwt";

describe("private route middleware", () => {
  it("redirects unauthenticated users from private pages to login", () => {
    const response = middleware(new NextRequest("http://localhost/convocatorias"));

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe("http://localhost/auth/login?next=%2Fconvocatorias");
  });

  it("allows authenticated users and public pages", () => {
    process.env.JWT_SECRET = "test-secret-with-enough-length";
    const token = createAuthToken({ userId: "user_123", email: "ada@example.com" });
    const privateResponse = middleware(
      new NextRequest("http://localhost/bookmarks", { headers: { cookie: `auth_token=${token}` } }),
    );
    const publicResponse = middleware(new NextRequest("http://localhost/auth/login"));

    expect(privateResponse).toBeUndefined();
    expect(publicResponse).toBeUndefined();
  });
});
