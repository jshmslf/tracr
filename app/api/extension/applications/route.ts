import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyExtensionToken } from "@/lib/extension-auth";
import { applicationSchema } from "@/lib/validation";
import { createApplicationRecord } from "@/lib/applications";

export async function POST(request: NextRequest) {
  const auth = await verifyExtensionToken(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = applicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid application data" }, { status: 400 });
  }

  try {
    await createApplicationRecord(auth.userId, parsed.data, "extension");
  } catch {
    return NextResponse.json({ error: "Could not save application" }, { status: 500 });
  }

  revalidatePath("/applications");
  return NextResponse.json({ status: "ok" });
}
