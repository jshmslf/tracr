import * as cheerio from "cheerio";
import { currencyValues } from "@/lib/db/schema";
import { sanitizeDescriptionHtml } from "@/lib/sanitize";
import type { ScrapeResult, JobType, SalaryPeriod } from "@/lib/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const FETCH_TIMEOUT_MS = 8000;

function descriptionToSafeHtml(html: string): string {
  return sanitizeDescriptionHtml(html).trim();
}

function normalizeSalaryPeriod(raw: unknown): SalaryPeriod | undefined {
  if (typeof raw !== "string") return undefined;
  const value = raw.toUpperCase();
  if (value.includes("HOUR")) return "hourly";
  if (value.includes("MONTH")) return "monthly";
  if (value.includes("YEAR") || value.includes("ANNUM")) return "yearly";
  return undefined;
}

function normalizeCurrency(raw: unknown): (typeof currencyValues)[number] | undefined {
  if (typeof raw !== "string") return undefined;
  const value = raw.trim().toUpperCase();
  return (currencyValues as readonly string[]).includes(value)
    ? (value as (typeof currencyValues)[number])
    : undefined;
}

function normalizeWorkArrangement(raw: unknown): JobType | undefined {
  if (typeof raw !== "string") return undefined;
  const value = raw.toLowerCase();
  if (value.includes("telecommute") || value.includes("remote")) return "remote";
  if (value.includes("hybrid")) return "hybrid";
  if (value.includes("onsite") || value.includes("on-site") || value.includes("on site")) return "onsite";
  return undefined;
}

function extractFromJsonLd($: cheerio.CheerioAPI): Partial<ScrapeResult> {
  const result: Partial<ScrapeResult> = {};

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    const candidates = Array.isArray(parsed) ? parsed : [parsed];
    for (const candidate of candidates) {
      const node = candidate as Record<string, unknown>;
      const graph = node["@graph"];
      const items = Array.isArray(graph) ? graph : [node];

      for (const item of items as Record<string, unknown>[]) {
        if (item["@type"] !== "JobPosting") continue;

        if (typeof item.title === "string") result.jobTitle = item.title;

        const org = item.hiringOrganization as Record<string, unknown> | undefined;
        if (org && typeof org.name === "string") result.companyName = org.name;

        if (typeof item.description === "string") {
          result.description = descriptionToSafeHtml(item.description);
        }

        const location = item.jobLocation as
          | Record<string, unknown>
          | Record<string, unknown>[]
          | undefined;
        const loc = Array.isArray(location) ? location[0] : location;
        const address = loc?.address as Record<string, unknown> | undefined;
        if (address) {
          const parts = [address.addressLocality, address.addressRegion, address.addressCountry]
            .filter((p): p is string => typeof p === "string");
          if (parts.length) result.location = parts.join(", ");
        }

        const jobLocationType = Array.isArray(item.jobLocationType)
          ? item.jobLocationType[0]
          : item.jobLocationType;
        const arrangement = normalizeWorkArrangement(jobLocationType);
        if (arrangement) result.jobType = arrangement;

        const salary = item.baseSalary as Record<string, unknown> | undefined;
        const salaryValue = salary?.value as Record<string, unknown> | undefined;
        if (salaryValue) {
          if (typeof salaryValue.minValue === "number") result.salaryMin = salaryValue.minValue;
          if (typeof salaryValue.maxValue === "number") result.salaryMax = salaryValue.maxValue;
          if (typeof salaryValue.value === "number" && !result.salaryMin) {
            result.salaryMin = salaryValue.value;
            result.salaryMax = salaryValue.value;
          }
          const currency = normalizeCurrency(salary?.currency);
          if (currency) result.salaryCurrency = currency;

          const period = normalizeSalaryPeriod(salaryValue.unitText);
          if (period) result.salaryPeriod = period;
        }

        return;
      }
    }
  });

  return result;
}

function extractFromOpenGraph($: cheerio.CheerioAPI): Partial<ScrapeResult> {
  const result: Partial<ScrapeResult> = {};

  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDescription = $('meta[property="og:description"]').attr("content");
  const ogSiteName = $('meta[property="og:site_name"]').attr("content");

  if (ogTitle) result.jobTitle = ogTitle.trim();
  if (ogDescription) result.description = `<p>${ogDescription.trim()}</p>`;
  if (ogSiteName) result.companyName = ogSiteName.trim();

  if (!result.jobTitle) {
    const titleTag = $("title").text().trim();
    if (titleTag) result.jobTitle = titleTag;
  }

  return result;
}

export function extractFromHtml(html: string): ScrapeResult {
  const $ = cheerio.load(html);
  const warnings: string[] = [];

  const jsonLd = extractFromJsonLd($);
  const og = extractFromOpenGraph($);

  const merged: Partial<ScrapeResult> = { ...og, ...jsonLd };

  const fields: (keyof Omit<ScrapeResult, "warnings" | "filledFieldCount">)[] = [
    "jobTitle",
    "companyName",
    "description",
    "location",
    "jobType",
    "salaryMin",
    "salaryMax",
    "salaryCurrency",
    "salaryPeriod",
  ];
  const filledFieldCount = fields.filter((f) => merged[f] !== undefined && merged[f] !== "").length;

  if (!merged.salaryMin && !merged.salaryMax) {
    warnings.push("No salary information found");
  }
  if (!merged.location) {
    warnings.push("No location found");
  }
  if (!merged.companyName) {
    warnings.push("Could not determine company name");
  }

  return {
    ...merged,
    warnings,
    filledFieldCount,
  };
}

export function hasUsableData(result: ScrapeResult): boolean {
  return Boolean(result.jobTitle) && Boolean(result.companyName) && result.filledFieldCount >= 2;
}

export async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error("URL did not return HTML content");
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function scrapeJobPostingFast(url: string): Promise<ScrapeResult | null> {
  try {
    const html = await fetchHtml(url);
    return extractFromHtml(html);
  } catch {
    return null;
  }
}

const NO_RESULT_FALLBACK: ScrapeResult = {
  warnings: ["Could not reach that page automatically. Please fill the form manually."],
  filledFieldCount: 0,
};

export async function scrapeJobPostingWithFallback(url: string): Promise<ScrapeResult> {
  const fastResult = await scrapeJobPostingFast(url);
  if (fastResult && hasUsableData(fastResult)) {
    return fastResult;
  }

  try {
    const response = await fetch(`${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      return fastResult ?? NO_RESULT_FALLBACK;
    }

    return (await response.json()) as ScrapeResult;
  } catch {
    return fastResult ?? NO_RESULT_FALLBACK;
  }
}
