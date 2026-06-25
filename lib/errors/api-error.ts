import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function validationError(error: ZodError) {
  return NextResponse.json(
    { error: "Invalid input", issues: error.flatten().fieldErrors },
    { status: 400 },
  );
}

export function internalError() {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
