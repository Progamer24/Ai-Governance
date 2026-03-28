import { useState, type ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

export interface Column<T extends Record<string, unknown>> {
  key: string
  label: string
  render?: (value: unknown, row: T) => ReactNode
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  onRowClick?: (row: T) => void
}

type SortDir = 'asc' | 'desc' | null

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'))
      if (sortDir === 'desc') setSortKey(null)
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/3 border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="px-4 py-3 text-left text-white/50 font-medium cursor-pointer select-none hover:text-white/80 transition-colors"
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <span className="flex flex-col">
                    <ChevronUp
                      size={10}
                      className={clsx(
                        sortKey === col.key && sortDir === 'asc' ? 'text-cyan' : 'text-white/20',
                      )}
                    />
                    <ChevronDown
                      size={10}
                      className={clsx(
                        sortKey === col.key && sortDir === 'desc' ? 'text-cyan' : 'text-white/20',
                      )}
                    />
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-white/5">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-white/10 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-white/30"
              >
                No data available
              </td>
            </tr>
          ) : (
            sorted.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'border-b border-white/5 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-white/5',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-white/80">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
