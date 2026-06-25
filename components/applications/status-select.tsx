"use client";

import { useState, useTransition } from "react";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/applications/status-badge";
import { updateApplicationStatus } from "@/app/(dashboard)/applications/actions";
import { applicationStatusValues } from "@/lib/db/schema";
import { type ApplicationStatus } from "@/lib/types";
import { Icon } from "@/components/icons/icon";
import { cn } from "@/lib/utils";

export function StatusSelect({
  id,
  status: initialStatus,
}: {
  id: string;
  status: ApplicationStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  function handleSelect(newStatus: ApplicationStatus) {
    if (newStatus === status) return;
    const prevStatus = status;
    setStatus(newStatus);
    startTransition(async () => {
      try {
        await updateApplicationStatus(id, newStatus);
        toast.success("Status updated.");
      } catch {
        setStatus(prevStatus);
        toast.error("Failed to update status.");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 rounded-md outline-none transition-opacity",
            isPending && "pointer-events-none opacity-50"
          )}
        >
          <StatusBadge status={status} />
          <Icon icon={faChevronDown} className="size-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {applicationStatusValues.map((s) => (
          <DropdownMenuItem
            key={s}
            onSelect={() => handleSelect(s)}
            className={cn(s === status && "bg-accent")}
          >
            <StatusBadge status={s} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
