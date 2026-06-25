import Link from "next/link";
import { headers } from "next/headers";
import {
  faBriefcase,
  faComments,
  faPaperPlane,
  faPlus,
  faQuoteLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/auth";
import { getApplicationStats, listApplications } from "@/lib/db/queries";
import { applicationStatusValues } from "@/lib/db/schema";
import { getDailyQuote } from "@/lib/quotes";
import type { ApplicationStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/icons/icon";
import { DataTable } from "@/components/applications/data-table";
import { columns } from "@/components/applications/columns";
import { Filters } from "@/components/applications/filters";

type SearchParams = Promise<{ status?: string; company?: string; search?: string }>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;
  const params = await searchParams;

  const status = applicationStatusValues.includes(params.status as ApplicationStatus)
    ? (params.status as ApplicationStatus)
    : undefined;

  const [stats, apps] = await Promise.all([
    getApplicationStats(userId),
    listApplications(userId, { status, company: params.company, search: params.search }),
  ]);

  const quote = getDailyQuote();

  const statCards = [
    { label: "Applied", value: stats.applied, icon: faPaperPlane },
    { label: "Interviewed", value: stats.interviewing, icon: faComments },
    { label: "Rejected", value: stats.rejected, icon: faXmark },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your job search at a glance</p>
        </div>
        <Button asChild>
          <Link href="/applications/new">
            <Icon icon={faPlus} />
            Add application
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex flex-col items-center gap-2 p-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Icon icon={card.icon} className="size-4 text-muted-foreground" />
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold tabular-nums tracking-tight">{card.value}</span>
                <p className="mt-0.5 text-sm text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Icon icon={faBriefcase} className="size-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold tabular-nums tracking-tight">{stats.total}</span>
              <p className="mt-0.5 text-sm text-muted-foreground">Total Jobs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent applications</h2>
            <p className="text-sm text-muted-foreground">
              {apps.length} application{apps.length === 1 ? "" : "s"}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/applications">View all</Link>
          </Button>
        </div>
        <Filters />
        <DataTable columns={columns} data={apps} basePath="/applications" pageSize={10} />
      </div>

      {/* Daily quote */}
      <Card className="relative overflow-hidden">
        <CardContent className="px-6 py-5">
          <Icon icon={faQuoteLeft} className="absolute right-4 top-4 size-10 text-foreground/5" />
          <p className="italic text-foreground">&ldquo;{quote.text}&rdquo;</p>
          <p className="mt-2 text-sm text-muted-foreground">{quote.author}</p>
        </CardContent>
      </Card>
    </div>
  );
}
