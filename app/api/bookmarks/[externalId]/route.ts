import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { internalError, validationError } from "@/lib/errors/api-error";
import { bookmarkDeleteQuerySchema, bookmarkParamsSchema } from "@/lib/validators/bookmarks";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    externalId: string;
  };
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const { externalId } = bookmarkParamsSchema.parse(context.params);
    const { source } = bookmarkDeleteQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );

    await prisma.bookmark.deleteMany({
      where: { userId: user.id, externalId, source },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    console.error("Bookmark delete error", error);
    return internalError();
  }
}
