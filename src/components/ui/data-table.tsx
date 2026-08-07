







"use client";
import React from "react";
// Custom components
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import CustomModel from "@/src/components/dashboard/shared/custom-model";

// Table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

// Tanstack react table
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Lucide icons
import { Plus, Search } from "lucide-react";

// Modal provider hook
import { useModal } from "@/src/providers/modal.provider";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

// Props interface for the table component
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterValue: string;
  actionButtonText?: React.ReactNode;
  modalChildren?: React.ReactNode;
  newTabLink?: string;
  searchPlaceholder: string;
  heading?: string;
  subheading?: string;
  noHeader?: true;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  filterValue,
  modalChildren,
  actionButtonText,
  searchPlaceholder,
  heading,
  subheading,
  noHeader,
  newTabLink,
}: DataTableProps<TData, TValue>) {
  // Modal state
  const { setOpen } = useModal();

  // React table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      {/* Search input and action buttons */}
      <div className="flex items-center justify-between py-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          <Search />
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(filterValue)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterValue)?.setFilterValue(event.target.value)
            }
            className="h-12"
          />
        </div>

        {/* Right buttons (Create / Create in new page) */}
        <div className="flex items-center gap-x-2">
          {modalChildren && (
            <Button
              className="h-12 flex items-center gap-2"
              onClick={() => {
                if (modalChildren)
                  setOpen(
                    <CustomModel
                      heading={heading || ""}
                      subheading={subheading || ""}
                    >
                      {modalChildren}
                    </CustomModel>
                  );
              }}
            >
              {actionButtonText}
            </Button>
          )}

          {newTabLink && (
            <Link href={newTabLink}>
              <Button className="h-12 flex items-center gap-2 bg-main-primary text-white hover:bg-main-primary/90">
                <Plus size={15} />
                Create product
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border bg-background rounded-lg">
        <Table>
          {/* Table header */}
          {!noHeader && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          )}

          {/* Table body */}
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "align-middle",
                          cell.column.id === "image"
                            ? "w-56 min-w-56 max-w-56 py-3"
                            : "max-w-[400px] break-words"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              // No results message
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}















