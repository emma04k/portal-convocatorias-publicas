import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fetchConvocatorias } from "@/lib/secop/client";
import { internalError, validationError } from "@/lib/errors/api-error";
import { convocatoriaQuerySchema } from "@/lib/validators/convocatorias";

export const dynamic = "force-dynamic";

function upstreamError() {
  return NextResponse.json({ error: "SECOP upstream unavailable" }, { status: 502 });
}

export async function GET(request: Request) {
  try {
    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
    const filters = convocatoriaQuerySchema.parse(searchParams);
    const result = await fetchConvocatorias(filters);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    if (error instanceof Error && error.message.startsWith("SECOP upstream")) {
      console.error("SECOP list error", error);
      return upstreamError();
    }

    console.error("Convocatorias list error", error);
    return internalError();
  }
}
