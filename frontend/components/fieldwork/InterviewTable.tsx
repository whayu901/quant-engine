'use client';

import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  createColumnHelper, type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, TableSortLabel,
} from '@mui/material';
import { qcStatusColor } from '@/components/fieldwork/qcStatus';
import type { Interview } from '@/types/fieldwork';

const ch = createColumnHelper<Interview>();

const columns = [
  ch.accessor('external_id', { header: 'Respondent', cell: (i) => i.getValue() ?? '—' }),
  ch.accessor('interviewer_id', { header: 'Interviewer', cell: (i) => i.getValue() ?? '—' }),
  ch.accessor('duration_sec', {
    header: 'Duration (s)',
    cell: (i) => i.getValue() ?? '—',
  }),
  ch.accessor('qc_score', {
    header: 'QC score',
    cell: (i) => { const v = i.getValue(); return v == null ? '—' : v.toFixed(2); },
  }),
  ch.accessor('qc_status', {
    header: 'Status',
    cell: (i) => (
      <Chip size="small" label={i.getValue()} color={qcStatusColor(i.getValue())}
            sx={{ textTransform: 'capitalize' }} />
    ),
  }),
];

export default function InterviewTable({
  data, onRowClick,
}: { data: Interview[]; onRowClick: (iv: Interview) => void }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <TableCell key={header.id}>
                    <TableSortLabel
                      active={!!sorted}
                      direction={sorted === 'desc' ? 'desc' : 'asc'}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableSortLabel>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} hover sx={{ cursor: 'pointer' }}
                      onClick={() => onRowClick(row.original)}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
