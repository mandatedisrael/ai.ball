import { NextResponse } from "next/server";

import { SUPPORTED_LEAGUES } from "@/lib/leagues";

export async function GET() {
  return NextResponse.json({ leagues: SUPPORTED_LEAGUES });
}