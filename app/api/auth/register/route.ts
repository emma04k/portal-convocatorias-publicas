import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hashPassword } from "@/lib/auth/bcrypt";
import { createAuthToken } from "@/lib/auth/jwt";
import { createAuthCookie, toSafeUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { internalError, validationError } from "@/lib/errors/api-error";
import { registerSchema } from "@/lib/validators/auth";

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });
    const safeUser = toSafeUser(user);
    const token = createAuthToken({ userId: safeUser.id, email: safeUser.email });

    return NextResponse.json(
      { user: safeUser },
      {
        status: 201,
        headers: { "set-cookie": createAuthCookie(token) },
      },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    console.error("Register error", error);
    return internalError();
  }
}
