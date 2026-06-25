import { describe, expect, it } from "vitest";
import { bookmarkParamsSchema, createBookmarkSchema } from "@/lib/validators/bookmarks";

describe("bookmark validation", () => {
  it("normalizes a bookmark payload with optional metadata", () => {
    const parsed = createBookmarkSchema.parse({
      externalId: "  CO1.REQ.2577563  ",
      source: "SECOP_II",
      title: "  Prestación de servicios profesionales  ",
      entityName: "  DANE  ",
      status: "  Presentación de oferta  ",
      processNumber: "  EDP-545-2022  ",
      url: "https://community.secop.gov.co/process",
      rawData: { id_del_proceso: "CO1.REQ.2577563" },
    });

    expect(parsed).toEqual({
      externalId: "CO1.REQ.2577563",
      source: "SECOP_II",
      title: "Prestación de servicios profesionales",
      entityName: "DANE",
      status: "Presentación de oferta",
      processNumber: "EDP-545-2022",
      url: "https://community.secop.gov.co/process",
      rawData: { id_del_proceso: "CO1.REQ.2577563" },
    });
  });

  it("rejects invalid bookmark payloads and blank route params", () => {
    expect(() => createBookmarkSchema.parse({ externalId: "", title: "T", entityName: "E" })).toThrow();
    expect(() => createBookmarkSchema.parse({ externalId: "CO1", title: "", entityName: "E" })).toThrow();
    expect(() => createBookmarkSchema.parse({ externalId: "CO1", title: "T", entityName: "E", url: "not-a-url" })).toThrow();
    expect(() => bookmarkParamsSchema.parse({ externalId: "   " })).toThrow();
  });
});
