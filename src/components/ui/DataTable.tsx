export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  align?: "left" | "right";
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyLabel?: string;
}

export function DataTable<T>({ columns, rows, rowKey, emptyLabel = "Nothing here yet." }: DataTableProps<T>) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-base-600/60 bg-base-700/30">
            {columns.map((col) => (
              <th
                key={col.header}
                style={{ width: col.width }}
                className={`px-4 py-3 label-eyebrow font-normal ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-ink-500 text-sm">
                {emptyLabel}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-base-600/40 last:border-0 hover:bg-base-700/20 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`px-4 py-3 text-ink-300 ${col.align === "right" ? "text-right" : "text-left"}`}
                >
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
