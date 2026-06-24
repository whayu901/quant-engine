import React from 'react';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import type { TableColumn } from '../types';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: TableColumn[];
}

export function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
}: VirtualizedTableProps<T>) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div
      style={style}
      className={`flex border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
    >
      {columns.map((col) => (
        <div key={col.key} className="flex-1 px-4 py-2 text-sm">
          {data[index][col.key]}
        </div>
      ))}
    </div>
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          itemCount={data.length}
          itemSize={40}
          width={width}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}
