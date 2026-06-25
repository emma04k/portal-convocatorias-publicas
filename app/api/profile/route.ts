import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth/bcrypt";
import { getCurrentUser, toSafeUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { internalError, validationError } from "@/lib/errors/api-error";
import { updateProfileSchema } from "@/lib/validators/profile";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const [bookmarks, savedSearches] = await Promise.all([
      prisma.bookmark.count({ where: { userId: user.id } }),
      prisma.savedSearch.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      profile: {
        user,
        activity: { bookmarks, savedSearches },
      },
    });
  } catch (error) {
    console.error("Profile read error", error);
    return internalError();
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const input = updateProfileSchema.parse(await request.json());
    const data: { name?: string; email?: string; passwordHash?: string } = {};

    if (input.name) {
      data.name = input.name;
    }

    if (input.email) {
      data.email = input.email;
    }

    if (input.newPassword) {
      const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!currentUser || !(await verifyPassword(input.currentPassword ?? "", currentUser.passwordHash))) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 401 });
      }

      data.passwordHash = await hashPassword(input.newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({ user: toSafeUser(updatedUser) });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    console.error("Profile update error", error);
    return internalError();
  }
}
