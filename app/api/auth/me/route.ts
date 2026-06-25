import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { internalError } from "@/lib/errors/api-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Current user error", error);
    return internalError();
  }
}
