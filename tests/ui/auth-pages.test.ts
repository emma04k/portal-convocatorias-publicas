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

  it("keeps development and production Next.js artifacts separate so global CSS is served", () => {
    const packageJson = readRepoFile("package.json");
    const nextConfig = readRepoFile("next.config.mjs");

    expect(packageJson).toContain("NEXT_DIST_DIR=.next-dev next dev");
    expect(packageJson).toContain("NEXT_DIST_DIR=.next-build next build");
    expect(packageJson).toContain("NEXT_DIST_DIR=.next-build next start");
    expect(nextConfig).toContain("distDir: process.env.NEXT_DIST_DIR");
    expect(readRepoFile(".gitignore")).toContain(".next-build/");
    expect(readRepoFile(".gitignore")).toContain(".next-dev/");
    expect(readRepoFile("tsconfig.json")).toContain(".next-build/types/**/*.ts");
    expect(readRepoFile("tsconfig.json")).toContain(".next-dev/types/**/*.ts");
  });

  it("hides landing login and register calls to action when the user is authenticated", () => {
    const source = readRepoFile("app/page.tsx");

    expect(source).toContain("cookies()");
    expect(source).toContain("AUTH_COOKIE_NAME");
    expect(source).toContain("isAuthenticated");
    expect(source).toContain("{!isAuthenticated ? (");
    expect(source).toContain("Ir a mi perfil");
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
