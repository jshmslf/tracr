import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { countApplications } from "@/lib/db/queries";
import { generateApplicationId } from "@/lib/id";
import { sanitizeDescriptionHtml } from "@/lib/sanitize";
import type { ApplicationInput } from "@/lib/validation";

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

export function buildApplicationValues(data: ApplicationInput) {
  return {
    jobTitle: data.jobTitle,
    companyName: data.companyName,
    jobUrl: data.jobUrl || null,
    description: data.description ? sanitizeDescriptionHtml(data.description) : null,
    salaryMin: data.salaryMin ?? null,
    salaryMax: data.salaryMax ?? null,
    salaryCurrency: data.salaryCurrency || "PHP",
    salaryPeriod: data.salaryPeriod || null,
    salaryRawText: data.salaryRawText || null,
    location: data.location || null,
    jobType: data.jobType || null,
    status: data.status,
    dateApplied: data.dateApplied ? new Date(data.dateApplied) : null,
    contactPerson: data.contactPerson || null,
    contactEmail: data.contactEmail || null,
    notes: data.notes || null,
  };
}

export async function createApplicationRecord(
  userId: string,
  data: ApplicationInput,
  source: string
): Promise<void> {
  const existingCount = await countApplications(userId);
  const sequence = existingCount + 1;
  const values = buildApplicationValues(data);

  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const id = generateApplicationId(sequence);
    try {
      await db.insert(applications).values({
        id,
        userId,
        source,
        ...values,
      });
      return;
    } catch (error) {
      if (isUniqueViolation(error) && attempt < maxAttempts - 1) {
        continue;
      }
      throw error;
    }
  }
}
