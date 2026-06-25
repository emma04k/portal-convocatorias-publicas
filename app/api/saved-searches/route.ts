import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { internalError, validationError } from "@/lib/errors/api-error";
import { createSavedSearchSchema } from "@/lib/validators/saved-searches";

export const dynamic = "force-dynamic";

type SavedSearchRecord = {
  id: string;
  name: string;
  query: string | null;
  entityName: string | null;
  status: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  filters: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function toDate(value: string | undefined): Date | undefined {
  return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
}

function toSavedSearchResponse(savedSearch: SavedSearchRecord) {
  return {
    id: savedSearch.id,
    name: savedSearch.name,
    query: savedSearch.query,
    entityName: savedSearch.entityName,
    status: savedSearch.status,
    dateFrom: savedSearch.dateFrom ? savedSearch.dateFrom.toISOString().slice(0, 10) : null,
    dateTo: savedSearch.dateTo ? savedSearch.dateTo.toISOString().slice(0, 10) : null,
    filters: savedSearch.filters,
    createdAt: savedSearch.createdAt.toISOString(),
    updatedAt: savedSearch.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ items: savedSearches.map(toSavedSearchResponse) });
  } catch (error) {
    console.error("Saved searches list error", error);
    return internalError();
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const input = createSavedSearchSchema.parse(await request.json());
    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: input.name,
        query: input.query,
        entityName: input.entityName,
        status: input.status,
        dateFrom: toDate(input.dateFrom),
        dateTo: toDate(input.dateTo),
        filters: input.filters as Prisma.InputJsonValue | undefined,
      },
    });

    return NextResponse.json({ item: toSavedSearchResponse(savedSearch) }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    console.error("Saved search create error", error);
    return internalError();
  }
}
