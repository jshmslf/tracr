import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import { extractFromHtml } from "@/lib/scrape";
import { scrapeUrlSchema } from "@/lib/validation";

// Headless rendering of JS-heavy pages can be slow. Vercel Hobby plan caps
// functions at 10s, which may not be enough here; Pro allows up to 60s+.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = scrapeUrlSchema.safeParse(body?.url);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const url = parsed.data;

  let browser;
  try {
    const playwright = await import("playwright-core");
    browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    });
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    const html = await page.content();
    await browser.close();

    const result = extractFromHtml(html);
    return NextResponse.json(result);
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 502 }
    );
  }
}
