import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { internalError, validationError } from "@/lib/errors/api-error";
import { createBookmarkSchema } from "@/lib/validators/bookmarks";

export const dynamic = "force-dynamic";

type BookmarkRecord = {
  id: string;
  externalId: string;
  source: string;
  title: string;
  entityName: string;
  status: string | null;
  processNumber: string | null;
  url: string | null;
  rawData: unknown;
  createdAt: Date;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function toBookmarkResponse(bookmark: BookmarkRecord) {
  return {
    id: bookmark.id,
    externalId: bookmark.externalId,
    source: bookmark.source,
    title: bookmark.title,
    entityName: bookmark.entityName,
    status: bookmark.status,
    processNumber: bookmark.processNumber,
    url: bookmark.url,
    rawData: bookmark.rawData,
    createdAt: bookmark.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items: bookmarks.map(toBookmarkResponse) });
  } catch (error) {
    console.error("Bookmarks list error", error);
    return internalError();
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const input = createBookmarkSchema.parse(await request.json());
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_externalId_source: {
          userId: user.id,
          externalId: input.externalId,
          source: input.source,
        },
      },
      update: {},
      create: {
        userId: user.id,
        externalId: input.externalId,
        source: input.source,
        title: input.title,
        entityName: input.entityName,
        status: input.status,
        processNumber: input.processNumber,
        url: input.url,
        rawData: input.rawData as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ item: toBookmarkResponse(bookmark) }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    console.error("Bookmark create error", error);
    return internalError();
  }
}
