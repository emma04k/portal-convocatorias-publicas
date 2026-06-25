import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { internalError, validationError } from "@/lib/errors/api-error";
import { savedSearchParamsSchema, updateSavedSearchSchema } from "@/lib/validators/saved-searches";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function toDate(value: string | undefined): Date | undefined {
  return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const { id } = savedSearchParamsSchema.parse(context.params);
    const input = updateSavedSearchSchema.parse(await request.json());
    const result = await prisma.savedSearch.updateMany({
      where: { id, userId: user.id },
      data: {
        name: input.name,
        query: input.query,
        entityName: input.entityName,
        status: input.status,
        dateFrom: toDate(input.dateFrom),
        dateTo: toDate(input.dateTo),
        filters: input.filters as Prisma.InputJsonValue | undefined,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    console.error("Saved search update error", error);
    return internalError();
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const { id } = savedSearchParamsSchema.parse(context.params);
    await prisma.savedSearch.deleteMany({ where: { id, userId: user.id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    console.error("Saved search delete error", error);
    return internalError();
  }
}
