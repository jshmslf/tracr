"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { faWandMagicSparkles, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/applications/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/icons/icon";
import { DeleteConfirmDialog } from "@/components/applications/delete-confirm-dialog";
import { applicationStatusValues, jobTypeValues, salaryPeriodValues, currencyValues } from "@/lib/db/schema";
import { statusLabels, salaryPeriodLabels, type Application } from "@/lib/types";
import { applicationSchema } from "@/lib/validation";
import {
  createApplication,
  updateApplication,
  deleteApplication,
  scrapeAndPrefill,
} from "@/app/(dashboard)/applications/actions";

type ApplicationFormProps = {
  application?: Application;
};

function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatThousands(raw: string) {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

function onlyDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

export function ApplicationForm({ application }: ApplicationFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [scraping, setScraping] = useState(false);

  const [jobUrl, setJobUrl] = useState(application?.jobUrl ?? "");
  const [jobTitle, setJobTitle] = useState(application?.jobTitle ?? "");
  const [companyName, setCompanyName] = useState(application?.companyName ?? "");
  const [description, setDescription] = useState(application?.description ?? "");
  const [location, setLocation] = useState(application?.location ?? "");
  const [jobType, setJobType] = useState(application?.jobType ?? "");
  const [salaryMin, setSalaryMin] = useState(application?.salaryMin?.toString() ?? "");
  const [salaryMax, setSalaryMax] = useState(application?.salaryMax?.toString() ?? "");
  const [salaryCurrency, setSalaryCurrency] = useState(application?.salaryCurrency ?? "PHP");
  const [salaryPeriod, setSalaryPeriod] = useState(application?.salaryPeriod ?? "monthly");
  const [salaryRawText, setSalaryRawText] = useState(application?.salaryRawText ?? "");
  const [status, setStatus] = useState(application?.status ?? "saved");
  const [dateApplied, setDateApplied] = useState(
    toDateInputValue(application?.dateApplied) || (application ? "" : todayInputValue())
  );
  const [contactPerson, setContactPerson] = useState(application?.contactPerson ?? "");
  const [contactEmail, setContactEmail] = useState(application?.contactEmail ?? "");
  const [notes, setNotes] = useState(application?.notes ?? "");
  const [source, setSource] = useState<"scraped" | "manual">(
    application?.source === "scraped" ? "scraped" : "manual"
  );

  async function handleScrape() {
    if (!jobUrl) {
      toast.error("Paste a job posting link first.");
      return;
    }
    setScraping(true);
    try {
      const result = await scrapeAndPrefill(jobUrl);

      if (result.jobTitle) setJobTitle(result.jobTitle);
      if (result.companyName) setCompanyName(result.companyName);
      if (result.description) setDescription(result.description);
      if (result.location) setLocation(result.location);
      if (result.jobType) setJobType(result.jobType);
      if (result.salaryMin !== undefined) setSalaryMin(String(result.salaryMin));
      if (result.salaryMax !== undefined) setSalaryMax(String(result.salaryMax));
      if (result.salaryCurrency) setSalaryCurrency(result.salaryCurrency);
      if (result.salaryPeriod) setSalaryPeriod(result.salaryPeriod);
      if (result.salaryRawText) setSalaryRawText(result.salaryRawText);

      if (result.filledFieldCount > 0) {
        setSource("scraped");
        toast.success(`Auto-filled ${result.filledFieldCount} field${result.filledFieldCount === 1 ? "" : "s"} from this listing.`);
      } else {
        toast.message("No details found automatically. Please fill the form manually.");
      }
      if (result.warnings.length) {
        result.warnings.forEach((w) => toast.message(w));
      }
    } catch {
      toast.error("Could not reach that page. You can still fill the form manually.");
    } finally {
      setScraping(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const input = applicationSchema.safeParse({
      jobTitle,
      companyName,
      jobUrl,
      description,
      location,
      jobType: jobType || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryCurrency,
      salaryPeriod: salaryMin || salaryMax ? salaryPeriod : undefined,
      salaryRawText,
      status,
      dateApplied: dateApplied || undefined,
      contactPerson,
      contactEmail,
      notes,
      source,
    });

    if (!input.success) {
      toast.error(input.error.issues[0]?.message ?? "Please check the form for errors.");
      return;
    }

    startTransition(async () => {
      try {
        if (application) {
          await updateApplication(application.id, input.data);
          toast.success("Application saved.");
        } else {
          await createApplication(input.data);
          toast.success("Application added.");
        }
        router.push("/applications");
        router.refresh();
      } catch {
        toast.error("Something went wrong saving this application.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="jobUrl">Job posting link</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="jobUrl"
            type="url"
            placeholder="https://..."
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={handleScrape} disabled={scraping}>
            <Icon icon={faWandMagicSparkles} />
            {scraping ? "Reading link..." : "Auto-fill"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="jobTitle">Job title</Label>
          <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="companyName">Company</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <RichTextEditor value={description} onChange={setDescription} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Job type</Label>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {jobTypeValues.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {applicationStatusValues.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label>Currency</Label>
          <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyValues.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="salaryMin">Salary min</Label>
          <Input
            id="salaryMin"
            type="text"
            inputMode="numeric"
            value={formatThousands(salaryMin)}
            onChange={(e) => setSalaryMin(onlyDigits(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="salaryMax">Salary max</Label>
          <Input
            id="salaryMax"
            type="text"
            inputMode="numeric"
            value={formatThousands(salaryMax)}
            onChange={(e) => setSalaryMax(onlyDigits(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Pay period</Label>
          <Select value={salaryPeriod} onValueChange={(v) => setSalaryPeriod(v as typeof salaryPeriod)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {salaryPeriodValues.map((p) => (
                <SelectItem key={p} value={p}>
                  {salaryPeriodLabels[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:w-1/3">
        <Label htmlFor="dateApplied">Date applied</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="dateApplied"
            type="date"
            value={dateApplied}
            onChange={(e) => setDateApplied(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={() => setDateApplied(todayInputValue())}>
            Today
          </Button>
        </div>
      </div>

      {!salaryMin && !salaryMax && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="salaryRawText">Salary (if not a clean range)</Label>
          <Input
            id="salaryRawText"
            value={salaryRawText}
            onChange={(e) => setSalaryRawText(e.target.value)}
            placeholder="e.g. Competitive, DOE"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactPerson">Contact person</Label>
          <Input
            id="contactPerson"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save application"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/applications")}>
            Cancel
          </Button>
        </div>
        {application && (
          <DeleteConfirmDialog
            trigger={
              <Button type="button" variant="outline">
                <Icon icon={faTrash} />
                Delete
              </Button>
            }
            title="Delete this application?"
            description={`This will permanently remove "${application.jobTitle}" at ${application.companyName}. This cannot be undone.`}
            onConfirm={async () => {
              await deleteApplication(application.id);
              toast.success("Application deleted.");
              router.push("/applications");
              router.refresh();
            }}
          />
        )}
      </div>
    </form>
  );
}
