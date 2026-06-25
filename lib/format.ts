import { format } from "date-fns";
import type { Application } from "@/lib/types";

const periodSuffix: Record<string, string> = {
  hourly: " / hour",
  monthly: " / month",
  yearly: " / year",
};

export function formatSalary(
  app: Pick<Application, "salaryMin" | "salaryMax" | "salaryCurrency" | "salaryPeriod" | "salaryRawText">
) {
  if (app.salaryMin || app.salaryMax) {
    const currency = app.salaryCurrency ?? "PHP";
    const suffix = app.salaryPeriod ? periodSuffix[app.salaryPeriod] ?? "" : "";

    if (app.salaryMin && app.salaryMax && app.salaryMin !== app.salaryMax) {
      return `${currency} ${app.salaryMin.toLocaleString()} - ${app.salaryMax.toLocaleString()}${suffix}`;
    }
    const value = app.salaryMin ?? app.salaryMax;
    return `${currency} ${value?.toLocaleString()}${suffix}`;
  }
  return app.salaryRawText || "Not listed";
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return null;
  const d = new Date(date);
  const isCurrentYear = d.getFullYear() === new Date().getFullYear();
  return format(d, isCurrentYear ? "MMM d" : "MMM d, yyyy");
}
