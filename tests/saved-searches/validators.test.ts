import { describe, expect, it } from "vitest";
import { savedSearchParamsSchema, createSavedSearchSchema, updateSavedSearchSchema } from "@/lib/validators/saved-searches";

describe("saved search validation", () => {
  it("normalizes create payloads with reusable convocatoria filters", () => {
    const parsed = createSavedSearchSchema.parse({
      name: "  Mis procesos DANE  ",
      query: "  analítica  ",
      entityName: "  DANE  ",
      status: "  Presentación de oferta  ",
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
      filters: { modality: "Contratación directa" },
    });

    expect(parsed).toEqual({
      name: "Mis procesos DANE",
      query: "analítica",
      entityName: "DANE",
      status: "Presentación de oferta",
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
      filters: { modality: "Contratación directa" },
    });
  });

  it("supports partial updates and rejects invalid payloads", () => {
    expect(updateSavedSearchSchema.parse({ name: "  Nuevo nombre  " })).toEqual({ name: "Nuevo nombre" });
    expect(() => createSavedSearchSchema.parse({ name: "" })).toThrow();
    expect(() => createSavedSearchSchema.parse({ name: "Búsqueda", dateFrom: "20240101" })).toThrow();
    expect(() => createSavedSearchSchema.parse({ name: "Búsqueda", dateFrom: "2024-12-31", dateTo: "2024-01-01" })).toThrow();
    expect(() => updateSavedSearchSchema.parse({})).toThrow();
    expect(() => savedSearchParamsSchema.parse({ id: "   " })).toThrow();
  });
});
