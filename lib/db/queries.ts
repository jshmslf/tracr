import { and, count, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, applications, profile } from "@/lib/db/schema";
import type { ApplicationStatus } from "@/lib/types";

export type ApplicationFilters = {
  status?: ApplicationStatus;
  company?: string;
  search?: string;
};

export async function listApplications(userId: string, filters: ApplicationFilters) {
  const conditions = [eq(applications.userId, userId)];

  if (filters.status) {
    conditions.push(eq(applications.status, filters.status));
  }
  if (filters.company) {
    conditions.push(ilike(applications.companyName, `%${filters.company}%`));
  }
  if (filters.search) {
    conditions.push(ilike(applications.jobTitle, `%${filters.search}%`));
  }

  return db
    .select()
    .from(applications)
    .where(and(...conditions))
    .orderBy(desc(applications.createdAt));
}

export async function getApplication(userId: string, id: string) {
  const rows = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getApplicationStats(userId: string) {
  const rows = await db
    .select({
      total: count(),
      applied: sql<number>`count(*) filter (where ${applications.status} = 'applied')`,
      interviewing: sql<number>`count(*) filter (where ${applications.status} = 'interviewing')`,
      rejected: sql<number>`count(*) filter (where ${applications.status} = 'rejected')`,
    })
    .from(applications)
    .where(eq(applications.userId, userId));

  const row = rows[0];
  return {
    total: Number(row?.total ?? 0),
    applied: Number(row?.applied ?? 0),
    interviewing: Number(row?.interviewing ?? 0),
    rejected: Number(row?.rejected ?? 0),
  };
}

export async function countApplications(userId: string) {
  const rows = await db
    .select({ value: count() })
    .from(applications)
    .where(eq(applications.userId, userId));

  return rows[0]?.value ?? 0;
}

export async function getProfile(userId: string) {
  const rows = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function hasPasswordAccount(userId: string) {
  const rows = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
    .limit(1);

  return rows.length > 0;
}
