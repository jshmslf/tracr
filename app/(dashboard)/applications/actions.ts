"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { applications, applicationStatusValues } from "@/lib/db/schema";
import { applicationSchema, scrapeUrlSchema } from "@/lib/validation";
import type { ApplicationStatus } from "@/lib/types";
import { scrapeJobPostingWithFallback } from "@/lib/scrape";
import { createApplicationRecord, buildApplicationValues } from "@/lib/applications";
import type { ScrapeResult } from "@/lib/types";

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  return session.user.id;
}

export async function createApplication(input: unknown) {
  const userId = await requireUserId();
  const data = applicationSchema.parse(input);

  await createApplicationRecord(userId, data, data.source ?? "manual");
  revalidatePath("/applications");
}

export async function updateApplication(id: string, input: unknown) {
  const userId = await requireUserId();
  const data = applicationSchema.parse(input);

  await db
    .update(applications)
    .set({
      ...buildApplicationValues(data),
      source: data.source ?? "manual",
      updatedAt: new Date(),
    })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));

  revalidatePath("/applications");
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const userId = await requireUserId();
  if (!applicationStatusValues.includes(status)) throw new Error("Invalid status");

  await db
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));

  revalidatePath(`/applications/${id}`);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function deleteApplication(id: string) {
  const userId = await requireUserId();

  await db
    .delete(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));

  revalidatePath("/applications");
}

export async function scrapeAndPrefill(url: string): Promise<ScrapeResult> {
  await requireUserId();
  const parsedUrl = scrapeUrlSchema.parse(url);
  return scrapeJobPostingWithFallback(parsedUrl);
}
