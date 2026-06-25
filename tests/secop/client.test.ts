import { describe, expect, it, vi } from "vitest";
import { fetchConvocatoriaByExternalId, fetchConvocatorias } from "@/lib/secop/client";

describe("SECOP client", () => {
  it("builds safe SODA parameters for filters and pagination", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await fetchConvocatorias(
      { q: "salud", entity: "DANE", status: "Abierto", dateFrom: "2024-01-01", dateTo: "2024-12-31", limit: 10, offset: 5 },
      fetchMock,
    );

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe("https://www.datos.gov.co/resource/p6dx-8zbt.json");
    expect(url.searchParams.get("$limit")).toBe("10");
    expect(url.searchParams.get("$offset")).toBe("5");
    expect(url.searchParams.get("$order")).toBe("fecha_de_publicacion_del DESC");
    expect(url.searchParams.get("$q")).toBe("salud");
    expect(url.searchParams.get("entidad")).toBe("DANE");
    expect(url.searchParams.get("estado_resumen")).toBe("Abierto");
    expect(url.searchParams.get("$where")).toBe("fecha_de_publicacion_del >= '2024-01-01T00:00:00' AND fecha_de_publicacion_del <= '2024-12-31T23:59:59'");
  });

  it("normalizes records and surfaces controlled upstream failures", async () => {
    const okFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id_del_proceso: "CO1", nombre_del_procedimiento: "Proceso" }],
    });
    const result = await fetchConvocatorias({ limit: 20, offset: 0 }, okFetch);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].externalId).toBe("CO1");
    expect(result.pagination).toEqual({ limit: 20, offset: 0, count: 1 });

    const badFetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchConvocatorias({ limit: 20, offset: 0 }, badFetch)).rejects.toThrow("SECOP upstream request failed");
  });

  it("fetches a single convocatoria by external id with an escaped where clause", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id_del_proceso: "CO1.REQ.2577563", nombre_del_procedimiento: "Proceso" }],
    });

    const result = await fetchConvocatoriaByExternalId("CO1.REQ.2577563", fetchMock);
    const url = new URL(fetchMock.mock.calls[0][0]);

    expect(url.searchParams.get("$limit")).toBe("1");
    expect(url.searchParams.get("$where")).toBe("id_del_proceso = 'CO1.REQ.2577563'");
    expect(result?.externalId).toBe("CO1.REQ.2577563");
  });
});
