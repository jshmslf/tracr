import type { InferSelectModel } from "drizzle-orm";
import {
  applicationStatusValues,
  jobTypeValues,
  salaryPeriodValues,
  currencyValues,
  themeValues,
  applications,
} from "@/lib/db/schema";

export type Application = InferSelectModel<typeof applications>;

export type ApplicationStatus = (typeof applicationStatusValues)[number];
export type JobType = (typeof jobTypeValues)[number];
export type SalaryPeriod = (typeof salaryPeriodValues)[number];
export type Currency = (typeof currencyValues)[number];
export type ThemePreference = (typeof themeValues)[number];

export const statusLabels: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const salaryPeriodLabels: Record<SalaryPeriod, string> = {
  hourly: "Per hour",
  monthly: "Per month",
  yearly: "Per year",
};

export type ScrapeResult = {
  jobTitle?: string;
  companyName?: string;
  description?: string;
  location?: string;
  jobType?: JobType;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: SalaryPeriod;
  salaryRawText?: string;
  warnings: string[];
  filledFieldCount: number;
};
