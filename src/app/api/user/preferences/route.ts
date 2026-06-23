import { NextResponse } from "next/server";

import { userPreferencesSchema } from "@/lib/schemas/user";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/services/zerog/storage";

export async function GET() {
  const preferences = await getUserPreferences();
  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = userPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid preferences", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const preferences = await updateUserPreferences(parsed.data);
  return NextResponse.json({ preferences });
}