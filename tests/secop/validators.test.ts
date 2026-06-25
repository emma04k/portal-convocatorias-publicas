import { describe, expect, it } from "vitest";
import { convocatoriaDetailParamsSchema, convocatoriaQuerySchema } from "@/lib/validators/convocatorias";

describe("convocatoria query validation", () => {
  it("normalizes optional filters and applies safe pagination defaults", () => {
    const parsed = convocatoriaQuerySchema.parse({
      q: "  salud pública  ",
      entity: "  alcaldía  ",
      status: "  abierto  ",
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
    });

    expect(parsed).toEqual({
      q: "salud pública",
      entity: "alcaldía",
      status: "abierto",
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
      limit: 20,
      offset: 0,
    });
  });

  it("rejects unsafe pagination, invalid dates and blank detail identifiers", () => {
    expect(() => convocatoriaQuerySchema.parse({ limit: "101" })).toThrow();
    expect(() => convocatoriaQuerySchema.parse({ offset: "-1" })).toThrow();
    expect(() => convocatoriaQuerySchema.parse({ dateFrom: "20240101" })).toThrow();
    expect(() => convocatoriaDetailParamsSchema.parse({ externalId: "   " })).toThrow();
  });
});
