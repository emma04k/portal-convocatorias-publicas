import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyPassword } from "@/lib/auth/bcrypt";
import { createAuthToken } from "@/lib/auth/jwt";
import { createAuthCookie, toSafeUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { internalError, validationError } from "@/lib/errors/api-error";
import { loginSchema } from "@/lib/validators/auth";

const invalidCredentialsResponse = NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      return invalidCredentialsResponse;
    }

    const passwordIsValid = await verifyPassword(input.password, user.passwordHash);
    if (!passwordIsValid) {
      return invalidCredentialsResponse;
    }

    const safeUser = toSafeUser(user);
    const token = createAuthToken({ userId: safeUser.id, email: safeUser.email });

    return NextResponse.json(
      { user: safeUser },
      {
        status: 200,
        headers: { "set-cookie": createAuthCookie(token) },
      },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    console.error("Login error", error);
    return internalError();
  }
}
