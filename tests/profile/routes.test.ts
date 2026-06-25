import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import { GET, PATCH } from "@/app/api/profile/route";
import { createAuthToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    bookmark: {
      count: vi.fn(),
    },
    savedSearch: {
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockedPrisma = vi.mocked(prisma);

const userRecord = {
  id: "user_123",
  name: "Ada Lovelace",
  email: "ada@example.com",
  passwordHash: "hashed-password",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
};

function authedRequest(body?: unknown) {
  const token = createAuthToken({ userId: "user_123", email: "ada@example.com" });
  return new Request("http://localhost/api/profile", {
    method: body ? "PATCH" : "GET",
    headers: {
      cookie: `auth_token=${token}`,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("profile API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-with-enough-length";
  });

  it("returns safe profile data with activity counts", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(userRecord);
    mockedPrisma.bookmark.count.mockResolvedValue(3);
    mockedPrisma.savedSearch.count.mockResolvedValue(2);

    const response = await GET(authedRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.profile.user).toEqual({ id: "user_123", name: "Ada Lovelace", email: "ada@example.com" });
    expect(body.profile.activity).toEqual({ bookmarks: 3, savedSearches: 2 });
    expect(body.profile.user.passwordHash).toBeUndefined();
  });

  it("updates own profile name and email", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(userRecord);
    mockedPrisma.user.update.mockResolvedValue({ ...userRecord, name: "Ada King", email: "ada.king@example.com" });

    const response = await PATCH(authedRequest({ name: " Ada King ", email: " ADA.KING@example.COM " }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user).toEqual({ id: "user_123", name: "Ada King", email: "ada.king@example.com" });
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_123" },
      data: { name: "Ada King", email: "ada.king@example.com" },
    });
  });

  it("changes password only when current password is valid", async () => {
    const passwordHash = await bcrypt.hash("old-secret-123", 4);
    mockedPrisma.user.findUnique.mockResolvedValueOnce({ ...userRecord, passwordHash }).mockResolvedValueOnce({ ...userRecord, passwordHash });
    mockedPrisma.user.update.mockResolvedValue(userRecord);

    const response = await PATCH(authedRequest({ currentPassword: "old-secret-123", newPassword: "new-secret-123" }));

    expect(response.status).toBe(200);
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_123" },
      data: { passwordHash: expect.not.stringContaining("new-secret-123") },
    });
  });

  it("rejects unauthenticated profile access", async () => {
    const response = await GET(new Request("http://localhost/api/profile"));

    expect(response.status).toBe(401);
  });
});
