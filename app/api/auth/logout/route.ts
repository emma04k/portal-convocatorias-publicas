import { NextResponse } from "next/server";
import { createLogoutCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: { "set-cookie": createLogoutCookie() },
    },
  );
}
