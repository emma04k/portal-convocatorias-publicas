import { beforeEach, describe, expect, it } from "vitest";
import { createAuthToken, verifyAuthToken } from "@/lib/auth/jwt";

describe("JWT auth helpers", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-with-enough-length";
  });

  it("signs and verifies a token containing the user id and email", () => {
    const token = createAuthToken({ userId: "user_123", email: "ada@example.com" });

    const payload = verifyAuthToken(token);

    expect(payload).toMatchObject({
      userId: "user_123",
      email: "ada@example.com",
    });
  });

  it("rejects invalid tokens", () => {
    expect(verifyAuthToken("not-a-real-token")).toBeNull();
  });
});
