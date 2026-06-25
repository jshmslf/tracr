"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { applicationStatusValues } from "@/lib/db/schema";
import { statusLabels } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== (searchParams.get("search") ?? "")) {
        updateParam("search", search);
      }
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const activeStatus = searchParams.get("status") ?? "";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by job title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <Input
          placeholder="Filter by company"
          defaultValue={searchParams.get("company") ?? ""}
          onChange={(e) => updateParam("company", e.target.value)}
          className="w-full sm:max-w-xs"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["all", ...applicationStatusValues] as const).map((s) => {
          const isActive = s === "all" ? !activeStatus : activeStatus === s;
          return (
            <button
              key={s}
              onClick={() => updateParam("status", s === "all" ? "" : s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {s === "all" ? "All" : statusLabels[s]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
