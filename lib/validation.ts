import { z } from "zod";
import { applicationStatusValues, jobTypeValues, salaryPeriodValues, currencyValues } from "@/lib/db/schema";

export const applicationSchema = z.object({
  jobTitle: z.string().trim().min(1, "Job title is required"),
  companyName: z.string().trim().min(1, "Company name is required"),
  jobUrl: z.union([z.url(), z.literal("")]).optional(),
  description: z.string().trim().optional(),
  salaryMin: z.coerce.number().int().nonnegative().optional().nullable(),
  salaryMax: z.coerce.number().int().nonnegative().optional().nullable(),
  salaryCurrency: z.enum(currencyValues).optional(),
  salaryPeriod: z.enum(salaryPeriodValues).optional().nullable(),
  salaryRawText: z.string().trim().optional(),
  location: z.string().trim().optional(),
  jobType: z.enum(jobTypeValues).optional().nullable(),
  status: z.enum(applicationStatusValues),
  dateApplied: z.string().trim().optional().nullable(),
  contactPerson: z.string().trim().optional(),
  contactEmail: z.union([z.email(), z.literal("")]).optional(),
  notes: z.string().trim().optional(),
  source: z.enum(["scraped", "manual"]).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const scrapeUrlSchema = z.url();

export const profileSchema = z.object({
  fullName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
