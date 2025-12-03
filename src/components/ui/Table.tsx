import { ReactNode } from 'react'
import clsx from 'clsx'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
}

export function Table<T extends { name: string }>({
  columns,
  data,
  loading,
  emptyMessage = 'No data available',
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-primary)] shadow-sm">
        <div className="bg-[var(--color-bg-secondary)]">
          <div className="grid gap-4 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 shimmer rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-primary)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-sm text-[var(--color-text-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={item.name || idx}
                  onClick={() => onRowClick?.(item)}
                  className={clsx(
                    'bg-[var(--color-bg-primary)] transition-all duration-200',
                    onRowClick && 'cursor-pointer hover:bg-[var(--color-bg-secondary)]'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx('px-6 py-4 text-sm whitespace-nowrap', col.className)}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
