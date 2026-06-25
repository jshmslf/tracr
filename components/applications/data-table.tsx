"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  type SortingState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { faSort, faSortUp, faSortDown, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/icons/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  basePath?: string;
  pageSize?: number;
};

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  basePath,
  pageSize,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize ?? data.length,
  });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, ...(pageSize ? { pagination } : {}) },
    onSortingChange: setSorting,
    ...(pageSize ? { onPaginationChange: setPagination } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pageSize ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  });

  const showPagination = pageSize && table.getPageCount() > 1;

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      className={sortable ? "cursor-pointer select-none" : undefined}
                      onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                    >
                      {header.isPlaceholder ? null : (
                        <span className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortable &&
                            (header.column.getIsSorted() === "asc" ? (
                              <Icon icon={faSortUp} className="size-3 text-muted-foreground" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <Icon icon={faSortDown} className="size-3 text-muted-foreground" />
                            ) : (
                              <Icon icon={faSort} className="size-3 text-muted-foreground/50" />
                            ))}
                        </span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(basePath && "cursor-pointer")}
                  onClick={basePath ? () => router.push(`${basePath}/${row.original.id}`) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <Icon icon={faChevronLeft} className="size-3" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <Icon icon={faChevronRight} className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
