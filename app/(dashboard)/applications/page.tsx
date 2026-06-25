import Link from "next/link";
import { headers } from "next/headers";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/auth";
import { listApplications } from "@/lib/db/queries";
import { applicationStatusValues } from "@/lib/db/schema";
import type { ApplicationStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { DataTable } from "@/components/applications/data-table";
import { columns } from "@/components/applications/columns";
import { Filters } from "@/components/applications/filters";

type SearchParams = Promise<{ status?: string; company?: string; search?: string }>;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const params = await searchParams;

  const status = applicationStatusValues.includes(params.status as ApplicationStatus)
    ? (params.status as ApplicationStatus)
    : undefined;

  const apps = await listApplications(session!.user.id, {
    status,
    company: params.company,
    search: params.search,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-sm text-muted-foreground">
            {apps.length} application{apps.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild>
          <Link href="/applications/new">
            <Icon icon={faPlus} />
            Add application
          </Link>
        </Button>
      </div>

      <Filters />

      <DataTable columns={columns} data={apps} basePath="/applications" pageSize={10} />
    </div>
  );
}
