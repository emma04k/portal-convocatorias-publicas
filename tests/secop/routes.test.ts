import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as listConvocatorias } from "@/app/api/convocatorias/route";
import { GET as getConvocatoria } from "@/app/api/convocatorias/[externalId]/route";
import { fetchConvocatoriaByExternalId, fetchConvocatorias } from "@/lib/secop/client";

vi.mock("@/lib/secop/client", () => ({
  fetchConvocatoriaByExternalId: vi.fn(),
  fetchConvocatorias: vi.fn(),
}));

const mockedFetchConvocatorias = vi.mocked(fetchConvocatorias);
const mockedFetchConvocatoriaByExternalId = vi.mocked(fetchConvocatoriaByExternalId);

describe("convocatorias API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists convocatorias with validated query filters", async () => {
    mockedFetchConvocatorias.mockResolvedValue({
      items: [{ externalId: "CO1", title: "Proceso", entityName: "DANE", source: "SECOP_II", rawData: {} }],
      pagination: { limit: 10, offset: 0, count: 1 },
    });

    const response = await listConvocatorias(
      new Request("http://localhost/api/convocatorias?q=salud&entity=DANE&limit=10"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(mockedFetchConvocatorias).toHaveBeenCalledWith(
      expect.objectContaining({ q: "salud", entity: "DANE", limit: 10, offset: 0 }),
    );
  });

  it("returns validation errors and controlled upstream errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const badRequest = await listConvocatorias(new Request("http://localhost/api/convocatorias?limit=500"));
    expect(badRequest.status).toBe(400);

    mockedFetchConvocatorias.mockRejectedValue(new Error("SECOP upstream request failed with status 503"));
    const upstreamError = await listConvocatorias(new Request("http://localhost/api/convocatorias"));
    const body = await upstreamError.json();

    expect(upstreamError.status).toBe(502);
    expect(body.error).toBe("SECOP upstream unavailable");
    consoleError.mockRestore();
  });

  it("returns convocatoria detail or 404 by external id", async () => {
    mockedFetchConvocatoriaByExternalId.mockResolvedValueOnce({
      externalId: "CO1",
      title: "Proceso",
      entityName: "DANE",
      source: "SECOP_II",
      rawData: {},
    });

    const okResponse = await getConvocatoria(new Request("http://localhost/api/convocatorias/CO1"), {
      params: { externalId: "CO1" },
    });
    expect(okResponse.status).toBe(200);

    mockedFetchConvocatoriaByExternalId.mockResolvedValueOnce(null);
    const notFoundResponse = await getConvocatoria(new Request("http://localhost/api/convocatorias/missing"), {
      params: { externalId: "missing" },
    });
    expect(notFoundResponse.status).toBe(404);
  });
});
