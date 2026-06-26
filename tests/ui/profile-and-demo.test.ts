import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("profile and demo documentation", () => {
  it("renders a profile page with account editing, password change and activity counts", () => {
    const page = read("app/profile/page.tsx");
    const profile = read("components/profile/profile-manager.tsx");

    expect(page).toContain("ProfileManager");
    expect(profile).toContain("/api/profile");
    expect(profile).toContain("name=\"name\"");
    expect(profile).toContain("name=\"email\"");
    expect(profile).toContain("name=\"currentPassword\"");
    expect(profile).toContain("name=\"newPassword\"");
    expect(profile).toContain("Favoritos guardados");
    expect(profile).toContain("Búsquedas guardadas");
  });

  it("keeps the password form reference before awaiting the password update", () => {
    const profile = read("components/profile/profile-manager.tsx");

    expect(profile).toContain("const passwordForm = event.currentTarget;");
    expect(profile).toContain("const formData = new FormData(passwordForm);");
    expect(profile).toContain("passwordForm.reset();");
    expect(profile).not.toContain("event.currentTarget.reset();");
  });

  it("shows dedicated success messages after updating profile data and password", () => {
    const profile = read("components/profile/profile-manager.tsx");

    expect(profile).toContain("accountMessage");
    expect(profile).toContain("passwordMessage");
    expect(profile).toContain("Tus datos de perfil se actualizaron correctamente.");
    expect(profile).toContain("Tu contraseña se actualizó correctamente.");
    expect(profile).toContain("aria-live=\"polite\"");
  });

  it("documents the end-to-end demo flow and security checklist", () => {
    const readme = read("README.md");

    expect(readme).toContain("## Flujo demo end-to-end");
    expect(readme).toContain("registro → login → convocatorias → favorito → búsquedas guardadas → perfil");
    expect(readme).toContain("## Checklist de seguridad básica");
    expect(readme).toContain("JWT en cookie HTTP-only");
    expect(readme).toContain("No commitear `.env`");
  });
});
