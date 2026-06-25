import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "@/app/api/bookmarks/[externalId]/route";
import { GET, POST } from "@/app/api/bookmarks/route";
import { createAuthToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    bookmark: {
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const mockedPrisma = vi.mocked(prisma);

function authenticatedRequest(url: string, init: RequestInit = {}) {
  const token = createAuthToken({ userId: "user_123", email: "ada@example.com" });
  return new Request(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      cookie: `auth_token=${token}`,
    },
  });
}

function bookmarkRecord(overrides = {}) {
  return {
    id: "bookmark_123",
    userId: "user_123",
    externalId: "CO1.REQ.2577563",
    source: "SECOP_II",
    title: "Prestación de servicios profesionales",
    entityName: "DANE",
    status: "Presentación de oferta",
    processNumber: "EDP-545-2022",
    url: "https://community.secop.gov.co/process",
    rawData: { id_del_proceso: "CO1.REQ.2577563" },
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("bookmarks API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-with-enough-length";
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: "user_123",
      name: "Ada Lovelace",
      email: "ada@example.com",
      passwordHash: "hash",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
  });

  it("requires authentication for bookmark operations", async () => {
    const listResponse = await GET(new Request("http://localhost/api/bookmarks"));
    const createResponse = await POST(
      new Request("http://localhost/api/bookmarks", { method: "POST", body: JSON.stringify({}) }),
    );
    const deleteResponse = await DELETE(new Request("http://localhost/api/bookmarks/CO1", { method: "DELETE" }), {
      params: { externalId: "CO1" },
    });

    expect(listResponse.status).toBe(401);
    expect(createResponse.status).toBe(401);
    expect(deleteResponse.status).toBe(401);
  });

  it("lists bookmarks for the authenticated user only", async () => {
    mockedPrisma.bookmark.findMany.mockResolvedValue([bookmarkRecord()]);

    const response = await GET(authenticatedRequest("http://localhost/api/bookmarks"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].userId).toBeUndefined();
    expect(mockedPrisma.bookmark.findMany).toHaveBeenCalledWith({
      where: { userId: "user_123" },
      orderBy: { createdAt: "desc" },
    });
  });

  it("creates or returns an existing bookmark without duplicating it", async () => {
    mockedPrisma.bookmark.upsert.mockResolvedValue(bookmarkRecord());

    const response = await POST(
      authenticatedRequest("http://localhost/api/bookmarks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          externalId: "CO1.REQ.2577563",
          source: "SECOP_II",
          title: "Prestación de servicios profesionales",
          entityName: "DANE",
          status: "Presentación de oferta",
          processNumber: "EDP-545-2022",
          url: "https://community.secop.gov.co/process",
          rawData: { id_del_proceso: "CO1.REQ.2577563" },
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.item.externalId).toBe("CO1.REQ.2577563");
    expect(body.item.userId).toBeUndefined();
    expect(mockedPrisma.bookmark.upsert).toHaveBeenCalledWith({
      where: {
        userId_externalId_source: {
          userId: "user_123",
          externalId: "CO1.REQ.2577563",
          source: "SECOP_II",
        },
      },
      update: {},
      create: expect.objectContaining({
        userId: "user_123",
        externalId: "CO1.REQ.2577563",
        source: "SECOP_II",
      }),
    });
  });

  it("deletes only the authenticated user's bookmark idempotently", async () => {
    mockedPrisma.bookmark.deleteMany.mockResolvedValue({ count: 0 });

    const response = await DELETE(authenticatedRequest("http://localhost/api/bookmarks/CO1.REQ.2577563", { method: "DELETE" }), {
      params: { externalId: "CO1.REQ.2577563" },
    });

    expect(response.status).toBe(204);
    expect(mockedPrisma.bookmark.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user_123", externalId: "CO1.REQ.2577563", source: "SECOP_II" },
    });
  });
});
