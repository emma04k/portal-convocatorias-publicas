import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("owned resource UI", () => {
  it("renders a bookmarks manager that lists and removes favorites", () => {
    const page = read("app/bookmarks/page.tsx");
    const manager = read("components/bookmarks/bookmarks-manager.tsx");

    expect(page).toContain("BookmarksManager");
    expect(manager).toContain("/api/bookmarks");
    expect(manager).toContain("Eliminar favorito");
    expect(manager).toContain("method: \"DELETE\"");
    expect(manager).toContain("/convocatorias/");
  });

  it("renders a saved searches manager that executes and deletes saved filters", () => {
    const page = read("app/saved-searches/page.tsx");
    const manager = read("components/saved-searches/saved-searches-manager.tsx");

    expect(page).toContain("SavedSearchesManager");
    expect(manager).toContain("/api/saved-searches");
    expect(manager).toContain("Ejecutar búsqueda");
    expect(manager).toContain("Eliminar búsqueda");
    expect(manager).toContain("method: \"DELETE\"");
    expect(manager).toContain("/convocatorias?");
  });
});
