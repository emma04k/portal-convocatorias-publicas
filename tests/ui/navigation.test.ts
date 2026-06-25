import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "components/layout/site-nav.tsx"), "utf8");

describe("site navigation", () => {
  it("links public auth pages and private portal sections", () => {
    expect(source).toContain("href=\"/\"");
    expect(source).toContain("href=\"/convocatorias\"");
    expect(source).toContain("href=\"/bookmarks\"");
    expect(source).toContain("href=\"/saved-searches\"");
    expect(source).toContain("href=\"/profile\"");
    expect(source).toContain("href=\"/auth/login\"");
    expect(source).toContain("href=\"/auth/register\"");
  });
});
