import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("calls browsing UI", () => {
  it("renders a convocatorias browser with filters, pagination, bookmarks and saved searches", () => {
    const page = read("app/convocatorias/page.tsx");
    const browser = read("components/convocatorias/convocatorias-browser.tsx");
    const card = read("components/convocatorias/convocatoria-card.tsx");

    expect(page).toContain("ConvocatoriasBrowser");
    expect(browser).toContain("/api/convocatorias");
    expect(browser).toContain("filters-fields");
    expect(browser).toContain("form-actions");
    expect(browser).toContain("name=\"q\"");
    expect(browser).toContain("name=\"entity\"");
    expect(browser).toContain("name=\"status\"");
    expect(browser).toContain("name=\"dateFrom\"");
    expect(browser).toContain("name=\"dateTo\"");
    expect(browser).toContain("Limpiar filtros");
    expect(browser).toContain("handleClearFilters");
    expect(browser).toContain("setFilters(INITIAL_FILTERS)");
    expect(browser).toContain("Guardar búsqueda");
    expect(browser).toContain("Siguiente");
    expect(card).toContain("Guardar favorito");
    expect(browser).toContain("/api/bookmarks");
    expect(card).toContain("/convocatorias/");

    const styles = read("app/globals.css");
    expect(styles).toContain(".filters-fields");
    expect(styles).toContain(".content-shell .content-card");
    expect(styles).toContain("gap: 1.25rem 1.75rem;");
    expect(styles).toContain("grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));");
    expect(styles).toContain("min-width: 0;");
    expect(styles).toContain("width: 100%;");
    expect(styles).toContain("@media (max-width: 900px)");
    expect(styles).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(styles).toContain("grid-column: 1 / -1;");
  });

  it("applies saved search query parameters when opening the convocatorias browser", () => {
    const page = read("app/convocatorias/page.tsx");
    const browser = read("components/convocatorias/convocatorias-browser.tsx");
    const savedSearches = read("components/saved-searches/saved-searches-manager.tsx");

    expect(savedSearches).toContain("/convocatorias?");
    expect(page).toContain("searchParams");
    expect(page).toContain("initialFilters");
    expect(browser).toContain("initialFilters");
    expect(browser).toContain("normalizeInitialFilters");
    expect(browser).toContain("useState<Filters>(() => normalizeInitialFilters(initialFilters))");
  });

  it("renders polished loading, empty and status states for the convocatorias experience", () => {
    const browser = read("components/convocatorias/convocatorias-browser.tsx");
    const card = read("components/convocatorias/convocatoria-card.tsx");
    const styles = read("app/globals.css");

    expect(browser).toContain("loading-state");
    expect(browser).toContain("aria-live=\"polite\"");
    expect(browser).toContain("empty-state");
    expect(browser).toContain("No se encontraron convocatorias con esos filtros.");
    expect(card).toContain("status-badge");
    expect(card).toContain("card-kicker");

    expect(styles).toContain(".status-badge");
    expect(styles).toContain(".loading-state,");
    expect(styles).toContain(".empty-state");
    expect(styles).toContain("min-height: 44px;");
    expect(styles).toContain("button:disabled");
    expect(styles).toContain("cursor: not-allowed;");
  });

  it("renders a detail page that can save a convocatoria as bookmark", () => {
    const page = read("app/convocatorias/[externalId]/page.tsx");
    const detail = read("components/convocatorias/convocatoria-detail.tsx");

    expect(page).toContain("ConvocatoriaDetail");
    expect(detail).toContain("/api/convocatorias/");
    expect(detail).toContain("Guardar favorito");
    expect(detail).toContain("/api/bookmarks");
  });
});
