import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("auth and landing pages", () => {
  it("renders landing content with navigation calls to action", () => {
    const source = readRepoFile("app/page.tsx");

    expect(source).toContain("Portal de Convocatorias Públicas");
    expect(source).toContain("Explorar convocatorias");
    expect(source).toContain("Crear cuenta");
    expect(source).toContain("Iniciar sesión");
  });

  it("renders login form wired to the auth API", () => {
    const page = readRepoFile("app/auth/login/page.tsx");
    const form = readRepoFile("components/auth/auth-form.tsx");

    expect(page).toContain("mode=\"login\"");
    expect(form).toContain("/api/auth/login");
    expect(form).toContain("name=\"email\"");
    expect(form).toContain("name=\"password\"");
    expect(form).toContain("/auth/register");
  });

  it("renders register form wired to the auth API", () => {
    const page = readRepoFile("app/auth/register/page.tsx");
    const form = readRepoFile("components/auth/auth-form.tsx");

    expect(page).toContain("mode=\"register\"");
    expect(form).toContain("/api/auth/register");
    expect(form).toContain("name=\"name\"");
    expect(form).toContain("name=\"email\"");
    expect(form).toContain("name=\"password\"");
    expect(form).toContain("/auth/login");
  });
});
