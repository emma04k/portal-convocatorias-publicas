import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fetchConvocatoriaByExternalId } from "@/lib/secop/client";
import { internalError, validationError } from "@/lib/errors/api-error";
import { convocatoriaDetailParamsSchema } from "@/lib/validators/convocatorias";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    externalId: string;
  };
};

function upstreamError() {
  return NextResponse.json({ error: "SECOP upstream unavailable" }, { status: 502 });
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { externalId } = convocatoriaDetailParamsSchema.parse(context.params);
    const convocatoria = await fetchConvocatoriaByExternalId(externalId);

    if (!convocatoria) {
      return NextResponse.json({ error: "Convocatoria not found" }, { status: 404 });
    }

    return NextResponse.json({ item: convocatoria });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    if (error instanceof Error && error.message.startsWith("SECOP upstream")) {
      console.error("SECOP detail error", error);
      return upstreamError();
    }

    console.error("Convocatoria detail error", error);
    return internalError();
  }
}
