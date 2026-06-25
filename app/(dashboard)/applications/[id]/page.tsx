import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  faArrowLeft,
  faPen,
  faLocationDot,
  faBriefcase,
  faSackDollar,
  faCalendar,
  faUpRightFromSquare,
  faWandMagicSparkles,
  faPuzzlePiece,
  faUser,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/auth";
import { getApplication } from "@/lib/db/queries";
import { formatSalary, formatDate } from "@/lib/format";
import { sanitizeDescriptionHtml, looksLikeHtml } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/icons/icon";
import { StatusSelect } from "@/components/applications/status-select";
import { ApplicationDeleteButton } from "@/components/applications/application-delete-button";
import type { ApplicationStatus } from "@/lib/types";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const application = await getApplication(session!.user.id, id);

  if (!application) notFound();

  const sourceLabel: Record<string, { label: string; icon: typeof faPen }> = {
    scraped: { label: "Auto-filled from posting", icon: faWandMagicSparkles },
    extension: { label: "Added via extension", icon: faPuzzlePiece },
    manual: { label: "Added manually", icon: faPen },
  };
  const source = sourceLabel[application.source ?? "manual"] ?? sourceLabel.manual;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/applications"
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon icon={faArrowLeft} />
        Back to applications
      </Link>

      <div className="rounded-lg border border-border">
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{application.jobTitle}</h1>
              <p className="text-muted-foreground">{application.companyName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusSelect id={application.id} status={application.status as ApplicationStatus} />
              <Badge variant="outline" className="gap-1.5 border-transparent bg-secondary text-secondary-foreground">
                <Icon icon={source.icon} className="size-3" />
                {source.label}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon icon={faLocationDot} />
              {application.location || "Not listed"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon icon={faBriefcase} />
              {application.jobType
                ? application.jobType.charAt(0).toUpperCase() + application.jobType.slice(1)
                : "Not listed"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon icon={faSackDollar} />
              {formatSalary(application)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon icon={faCalendar} />
              {formatDate(application.dateApplied) ?? "Not applied yet"}
            </div>
          </div>

          {application.jobUrl && (
            <Button asChild variant="outline" className="w-fit">
              <a href={application.jobUrl} target="_blank" rel="noreferrer">
                <Icon icon={faUpRightFromSquare} />
                View original posting
              </a>
            </Button>
          )}

          {application.description && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Description</h2>
              {looksLikeHtml(application.description) ? (
                <div
                  className="prose prose-sm max-h-80 max-w-none overflow-y-auto rounded-md border border-border p-4 text-muted-foreground prose-a:text-primary prose-a:underline prose-a:underline-offset-2"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeDescriptionHtml(application.description),
                  }}
                />
              ) : (
                <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-md border border-border p-4 text-sm text-muted-foreground">
                  {application.description}
                </div>
              )}
            </div>
          )}

          {(application.contactPerson || application.contactEmail) && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Contact</h2>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {application.contactPerson && (
                  <span className="flex items-center gap-2">
                    <Icon icon={faUser} />
                    {application.contactPerson}
                  </span>
                )}
                {application.contactEmail && (
                  <span className="flex items-center gap-2">
                    <Icon icon={faEnvelope} />
                    {application.contactEmail}
                  </span>
                )}
              </div>
            </div>
          )}

          {application.notes && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Notes</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{application.notes}</p>
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button asChild>
              <Link href={`/applications/${application.id}/edit`}>
                <Icon icon={faPen} />
                Edit
              </Link>
            </Button>
            <ApplicationDeleteButton
              applicationId={application.id}
              jobTitle={application.jobTitle}
              companyName={application.companyName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
