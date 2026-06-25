import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, PATCH } from "@/app/api/saved-searches/[id]/route";
import { GET, POST } from "@/app/api/saved-searches/route";
import { createAuthToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    savedSearch: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
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

function savedSearchRecord(overrides = {}) {
  return {
    id: "search_123",
    userId: "user_123",
    name: "Mis procesos DANE",
    query: "analítica",
    entityName: "DANE",
    status: "Presentación de oferta",
    dateFrom: new Date("2024-01-01T00:00:00.000Z"),
    dateTo: new Date("2024-12-31T00:00:00.000Z"),
    filters: { modality: "Contratación directa" },
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
  };
}

describe("saved searches API routes", () => {
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

  it("requires authentication for saved search operations", async () => {
    const listResponse = await GET(new Request("http://localhost/api/saved-searches"));
    const createResponse = await POST(new Request("http://localhost/api/saved-searches", { method: "POST", body: JSON.stringify({}) }));
    const updateResponse = await PATCH(new Request("http://localhost/api/saved-searches/search_123", { method: "PATCH", body: JSON.stringify({ name: "Nuevo" }) }), { params: { id: "search_123" } });
    const deleteResponse = await DELETE(new Request("http://localhost/api/saved-searches/search_123", { method: "DELETE" }), { params: { id: "search_123" } });

    expect(listResponse.status).toBe(401);
    expect(createResponse.status).toBe(401);
    expect(updateResponse.status).toBe(401);
    expect(deleteResponse.status).toBe(401);
  });

  it("lists saved searches for the authenticated user only", async () => {
    mockedPrisma.savedSearch.findMany.mockResolvedValue([savedSearchRecord()]);

    const response = await GET(authenticatedRequest("http://localhost/api/saved-searches"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].userId).toBeUndefined();
    expect(body.items[0].dateFrom).toBe("2024-01-01");
    expect(mockedPrisma.savedSearch.findMany).toHaveBeenCalledWith({
      where: { userId: "user_123" },
      orderBy: { updatedAt: "desc" },
    });
  });

  it("creates a saved search for the authenticated user", async () => {
    mockedPrisma.savedSearch.create.mockResolvedValue(savedSearchRecord());

    const response = await POST(authenticatedRequest("http://localhost/api/saved-searches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Mis procesos DANE", query: "analítica", entityName: "DANE", dateFrom: "2024-01-01" }),
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.item.name).toBe("Mis procesos DANE");
    expect(body.item.userId).toBeUndefined();
    expect(mockedPrisma.savedSearch.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user_123",
        name: "Mis procesos DANE",
        query: "analítica",
        entityName: "DANE",
        dateFrom: new Date("2024-01-01T00:00:00.000Z"),
      }),
    });
  });

  it("updates only the authenticated user's saved search", async () => {
    mockedPrisma.savedSearch.updateMany.mockResolvedValue({ count: 1 });

    const response = await PATCH(authenticatedRequest("http://localhost/api/saved-searches/search_123", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Nuevo nombre", status: "Abierto" }),
    }), { params: { id: "search_123" } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockedPrisma.savedSearch.updateMany).toHaveBeenCalledWith({
      where: { id: "search_123", userId: "user_123" },
      data: expect.objectContaining({ name: "Nuevo nombre", status: "Abierto" }),
    });
  });

  it("returns 404 when updating another user's saved search and deletes idempotently", async () => {
    mockedPrisma.savedSearch.updateMany.mockResolvedValue({ count: 0 });
    const notFound = await PATCH(authenticatedRequest("http://localhost/api/saved-searches/other", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Nope" }),
    }), { params: { id: "other" } });
    expect(notFound.status).toBe(404);

    mockedPrisma.savedSearch.deleteMany.mockResolvedValue({ count: 0 });
    const deleted = await DELETE(authenticatedRequest("http://localhost/api/saved-searches/other", { method: "DELETE" }), { params: { id: "other" } });
    expect(deleted.status).toBe(204);
    expect(mockedPrisma.savedSearch.deleteMany).toHaveBeenCalledWith({ where: { id: "other", userId: "user_123" } });
  });
});
