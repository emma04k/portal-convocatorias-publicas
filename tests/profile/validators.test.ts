import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "@/lib/validators/profile";

describe("profile validators", () => {
  it("normalizes editable profile fields", () => {
    const result = updateProfileSchema.parse({ name: " Ada Lovelace ", email: " ADA@example.COM " });

    expect(result).toEqual({ name: "Ada Lovelace", email: "ada@example.com" });
  });

  it("requires at least one profile change", () => {
    expect(() => updateProfileSchema.parse({})).toThrow("At least one field is required");
  });

  it("requires current password when changing password", () => {
    expect(() => updateProfileSchema.parse({ newPassword: "new-secret-123" })).toThrow("currentPassword is required");
  });
});
