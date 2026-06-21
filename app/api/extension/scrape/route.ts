import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyExtensionToken } from "@/lib/extension-auth";
import { scrapeJobPostingWithFallback } from "@/lib/scrape";
import { scrapeUrlSchema } from "@/lib/validation";

const bodySchema = z.object({ url: scrapeUrlSchema });

export async function POST(request: NextRequest) {
  const auth = await verifyExtensionToken(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const result = await scrapeJobPostingWithFallback(parsed.data.url);
  return NextResponse.json(result);
}
