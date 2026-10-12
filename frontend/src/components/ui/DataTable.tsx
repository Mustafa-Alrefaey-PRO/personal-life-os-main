/** Table primitives: pale-blue header, centered dark-blue cells, column dividers, zebra rows, blue hover. */
export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`h-13 border-b border-line bg-table-head px-2 text-sm font-bold whitespace-nowrap text-title ${className}`}>
      {children}
    </th>
  );
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-line transition-colors duration-150 last:border-b-0 even:bg-band hover:bg-hover">{children}</tr>;
}

export function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`h-13 border-x border-line-soft px-2 align-middle font-semibold text-title first:border-s-0 last:border-e-0 ${className}`}>{children}</td>;
}

/** Message shown inside the table body when there are no rows, so the column headers stay visible. */
export function EmptyRow({ colSpan, title, hint, action }: { colSpan: number; title: string; hint: string; action?: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center">
        <p className="text-base font-bold text-title">{title}</p>
        <p className="mt-1 text-sm text-muted">{hint}</p>
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </td>
    </tr>
  );
}
