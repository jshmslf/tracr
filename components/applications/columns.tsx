"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { faEllipsisVertical, faPen, faTrash, faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/applications/status-badge";
import { DeleteConfirmDialog } from "@/components/applications/delete-confirm-dialog";
import { deleteApplication } from "@/app/(dashboard)/applications/actions";
import { formatSalary, formatDate } from "@/lib/format";
import type { Application, ApplicationStatus } from "@/lib/types";

export const columns: ColumnDef<Application>[] = [
  {
    accessorKey: "jobTitle",
    header: "Job title",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block max-w-[220px] truncate font-medium">{row.original.jobTitle}</span>
        </TooltipTrigger>
        <TooltipContent>{row.original.jobTitle}</TooltipContent>
      </Tooltip>
    ),
  },
  {
    accessorKey: "companyName",
    header: "Company",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status as ApplicationStatus} />,
  },
  {
    id: "salary",
    header: "Salary",
    cell: ({ row }) => {
      const text = formatSalary(row.original);
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block max-w-[140px] truncate text-muted-foreground">{text}</span>
          </TooltipTrigger>
          <TooltipContent>{text}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => row.original.location || "-",
  },
  {
    id: "dateApplied",
    header: "Date applied",
    cell: ({ row }) => formatDate(row.original.dateApplied) ?? "-",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const app = row.original;
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <Icon icon={faEllipsisVertical} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/applications/${app.id}/edit`}>
                  <Icon icon={faPen} className="mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {app.jobUrl && (
                <DropdownMenuItem asChild>
                  <a href={app.jobUrl} target="_blank" rel="noreferrer">
                    <Icon icon={faUpRightFromSquare} className="mr-2" />
                    Open posting
                  </a>
                </DropdownMenuItem>
              )}
              <DeleteConfirmDialog
                trigger={
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Icon icon={faTrash} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                }
                title="Delete this application?"
                description={`This will permanently remove "${app.jobTitle}" at ${app.companyName}. This cannot be undone.`}
                onConfirm={async () => {
                  await deleteApplication(app.id);
                  toast.success("Application deleted.");
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
