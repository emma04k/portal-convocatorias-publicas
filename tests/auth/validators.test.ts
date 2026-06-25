import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validators/auth";

describe("auth validators", () => {
  it("normalizes registration email and trims names", () => {
    const result = registerSchema.parse({
      name: "  Ada Lovelace  ",
      email: "  ADA@Example.COM  ",
      password: "super-secret-123",
    });

    expect(result).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "super-secret-123",
    });
  });

  it("rejects weak registration passwords", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes login email", () => {
    const result = loginSchema.parse({
      email: "  USER@Example.COM ",
      password: "super-secret-123",
    });

    expect(result.email).toBe("user@example.com");
  });
});
