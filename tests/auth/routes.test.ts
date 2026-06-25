import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as me } from "@/app/api/auth/me/route";
import { POST as register } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/db/prisma";
import { createAuthToken } from "@/lib/auth/jwt";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const mockedPrisma = vi.mocked(prisma);

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("auth API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-with-enough-length";
  });

  it("registers a user with hashed password and returns a safe user plus httpOnly cookie", async () => {
    mockedPrisma.user.create.mockResolvedValue({
      id: "user_123",
      name: "Ada Lovelace",
      email: "ada@example.com",
      passwordHash: "hashed-password",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const response = await register(
      jsonRequest({ name: " Ada Lovelace ", email: " ADA@example.COM ", password: "super-secret-123" }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.user).toEqual({ id: "user_123", name: "Ada Lovelace", email: "ada@example.com" });
    expect(body.user.passwordHash).toBeUndefined();
    expect(response.headers.get("set-cookie")).toContain("auth_token=");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(mockedPrisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Ada Lovelace",
        email: "ada@example.com",
        passwordHash: expect.not.stringContaining("super-secret-123"),
      }),
    });
  });

  it("rejects duplicate registration emails", async () => {
    mockedPrisma.user.create.mockRejectedValue({ code: "P2002" });

    const response = await register(
      jsonRequest({ name: "Ada", email: "ada@example.com", password: "super-secret-123" }),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe("Email already registered");
  });

  it("logs in with valid credentials and rejects invalid credentials", async () => {
    const passwordHash = await bcrypt.hash("super-secret-123", 4);
    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user_123",
      name: "Ada Lovelace",
      email: "ada@example.com",
      passwordHash,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const okResponse = await login(jsonRequest({ email: "ADA@example.com", password: "super-secret-123" }));
    const okBody = await okResponse.json();

    expect(okResponse.status).toBe(200);
    expect(okBody.user).toEqual({ id: "user_123", name: "Ada Lovelace", email: "ada@example.com" });
    expect(okResponse.headers.get("set-cookie")).toContain("auth_token=");

    mockedPrisma.user.findUnique.mockResolvedValueOnce(null);
    const badResponse = await login(jsonRequest({ email: "missing@example.com", password: "super-secret-123" }));
    const badBody = await badResponse.json();

    expect(badResponse.status).toBe(401);
    expect(badBody.error).toBe("Invalid credentials");
  });

  it("returns the authenticated user from the auth cookie", async () => {
    const token = createAuthToken({ userId: "user_123", email: "ada@example.com" });
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: "user_123",
      name: "Ada Lovelace",
      email: "ada@example.com",
      passwordHash: "hashed-password",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const response = await me(
      new Request("http://localhost/api/auth/me", {
        headers: { cookie: `auth_token=${token}` },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user).toEqual({ id: "user_123", name: "Ada Lovelace", email: "ada@example.com" });
  });

  it("logs out by clearing the auth cookie", async () => {
    const response = await logout(new Request("http://localhost/api/auth/logout", { method: "POST" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(response.headers.get("set-cookie")).toContain("auth_token=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
