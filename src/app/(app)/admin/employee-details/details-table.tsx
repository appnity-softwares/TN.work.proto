'use client';

import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  HeaderGroup,
  Header,
  Row,
  Cell,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { approveUserDetails } from '@/app/api/admin-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { UserWithMeta } from '@/lib/types';

export const columns: ColumnDef<UserWithMeta>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'meta.mobileNumber',
    header: 'Mobile Number',
    cell: ({ row }: { row: Row<UserWithMeta> }) => row.original.meta?.mobileNumber,
  },
  {
    accessorKey: 'meta.address',
    header: 'Address',
    cell: ({ row }: { row: Row<UserWithMeta> }) => row.original.meta?.address,
  },
  {
    accessorKey: 'meta.emergencyContact',
    header: 'Emergency Contact',
    cell: ({ row }: { row: Row<UserWithMeta> }) => row.original.meta?.emergencyContact,
  },
  {
    id: 'actions',
    cell: ({ row }: { row: Row<UserWithMeta> }) => {
      const user = row.original;
      const router = useRouter();

      const handleApprove = async () => {
        try {
          await approveUserDetails(user.id);
          toast.success('Details approved!');
          router.refresh();
        } catch (error) {
          toast.error('Failed to approve details.');
        }
      };

      if (user.meta?.detailsApproved) {
        return <span className="text-sm text-green-600">Approved</span>;
      }

      return (
        <Button size="sm" onClick={handleApprove}>
          Approve
        </Button>
      );
    },
  },
];

interface EmployeeDetailsTableProps {
  users: UserWithMeta[];
}

export function EmployeeDetailsTable({ users }: EmployeeDetailsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<UserWithMeta>) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: Header<UserWithMeta, unknown>) => {
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row: Row<UserWithMeta>) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell: Cell<UserWithMeta, unknown>) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
