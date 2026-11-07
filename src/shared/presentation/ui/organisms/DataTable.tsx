import { useState, type ReactNode } from 'react'
import { Button } from '../atoms/Button'

export type DataTableColumn<Row> = {
  id: string
  label: string
  render: (row: Row) => ReactNode
  sortValue?: (row: Row) => string | number
  pin?: 'start' | 'end'
  className?: string
}

type SortState = { columnId: string; direction: 'ascending' | 'descending' }

type DataTableProps<Row> = {
  label: string
  columns: DataTableColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string
  emptyTitle: string
  emptyDescription?: string
  isLoading?: boolean
  isRefreshing?: boolean
  loadingRowCount?: number
  renderMobileRow?: (row: Row) => ReactNode
  footer?: ReactNode
}

function compareValues(left: string | number, right: string | number) {
  if (typeof left === 'number' && typeof right === 'number') return left - right
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' })
}

function sortRows<Row>(rows: Row[], column: DataTableColumn<Row> | undefined, direction: SortState['direction']) {
  if (!column?.sortValue) return rows

  const getSortValue = column.sortValue
  return [...rows].sort((left, right) => {
    const order = compareValues(getSortValue(left), getSortValue(right))
    return direction === 'ascending' ? order : -order
  })
}

function pinnedClasses(pin: DataTableColumn<unknown>['pin'], isHeader: boolean) {
  if (pin === 'start') return `sticky left-0 ${isHeader ? 'z-20 bg-canvas' : 'z-10 bg-surface group-hover:bg-canvas'}`
  if (pin === 'end') return `sticky right-0 ${isHeader ? 'z-20 bg-canvas' : 'z-10 bg-surface group-hover:bg-canvas'}`
  return ''
}

/** Compact desktop table with optional mobile row cards, sorting, pinned columns, and loading/empty states. */
export function DataTable<Row>({
  label,
  columns,
  rows,
  rowKey,
  emptyTitle,
  emptyDescription,
  isLoading = false,
  isRefreshing = false,
  loadingRowCount = 5,
  renderMobileRow,
  footer,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<SortState | null>(null)
  const sortedRows = sort
    ? sortRows(rows, columns.find((column) => column.id === sort.columnId), sort.direction)
    : rows
  const showEmptyState = !isLoading && sortedRows.length === 0

  function toggleSort(column: DataTableColumn<Row>) {
    if (!column.sortValue) return
    setSort((current) => ({
      columnId: column.id,
      direction: current?.columnId === column.id && current.direction === 'ascending' ? 'descending' : 'ascending',
    }))
  }

  return (
    <div className="overflow-hidden rounded-surface border border-line bg-surface">
      {renderMobileRow && <div className="grid divide-y divide-line md:hidden" role="list" aria-label={label} aria-busy={isLoading || isRefreshing}>
        {isLoading ? Array.from({ length: Math.min(loadingRowCount, 3) }, (_, index) => (
          <div key={`mobile-loading-${index}`} aria-hidden="true" className="h-[72px] animate-pulse bg-canvas" />
        )) : sortedRows.map((row) => (
          <div key={rowKey(row)} role="listitem">{renderMobileRow(row)}</div>
        ))}
      </div>}
      <div className={renderMobileRow ? 'hidden md:block' : undefined}>
      <div
        role="region"
        aria-label={label}
        aria-busy={isLoading || isRefreshing}
        tabIndex={0}
        className="overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus"
      >
        <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-left text-app-body-regular-regular">
          <caption className="sr-only">{label}</caption>
          <thead className="sticky top-0 bg-canvas text-content-muted">
            <tr>
              {columns.map((column) => {
                const isSorted = sort?.columnId === column.id
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={column.sortValue && isSorted ? sort.direction : undefined}
                    className={`text-app-header-table-semi-bold whitespace-nowrap border-b border-line px-4 py-3 ${pinnedClasses(column.pin, true)} ${column.className ?? ''}`}
                  >
                    {column.sortValue ? (
                      <Button type="button" variant="tertiary" size="small" className="!min-h-0 !gap-1.5 !rounded-none !px-0 !py-0 !text-app-header-table-semi-bold !text-content-muted hover:!bg-transparent hover:!text-content" onClick={() => toggleSort(column)}>
                        {column.label}
                        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={`size-3.5 ${isSorted ? 'text-action' : 'text-content-muted/60'}`}>
                          <path d="m5 6 3-3 3 3M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Button>
                    ) : column.label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: loadingRowCount }, (_, rowIndex) => (
              <tr key={`loading-${rowIndex}`} aria-hidden="true" className="group h-[72px]">
                {columns.map((column, columnIndex) => (
                  <td key={column.id} className={`border-b border-line px-4 py-3 ${pinnedClasses(column.pin, false)}`}>
                    <span className={`block h-3 animate-pulse rounded bg-line-strong/50 ${columnIndex === 0 ? 'w-32' : 'w-20'}`} />
                  </td>
                ))}
              </tr>
            )) : sortedRows.length > 0 ? sortedRows.map((row) => (
              <tr key={rowKey(row)} className="group h-[72px] transition-colors hover:bg-canvas/70 last:[&>td]:border-b-0">
                {columns.map((column) => (
                  <td key={column.id} className={`border-b border-line px-4 py-3 align-middle text-content ${pinnedClasses(column.pin, false)} ${column.className ?? ''}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            )) : null}
          </tbody>
        </table>
      </div>
      </div>
      {showEmptyState && (
        <div role="status" className="grid justify-items-center gap-form px-surface py-section text-center">
          <p className="text-app-subtitle-semi-bold text-content">{emptyTitle}</p>
          {emptyDescription && <p className="max-w-md text-app-body-regular-regular text-content-muted">{emptyDescription}</p>}
        </div>
      )}
      {footer && <div className="flex min-h-14 flex-wrap items-center justify-between gap-form border-t border-line px-surface py-form text-app-body-small-regular text-content-muted">{footer}</div>}
    </div>
  )
}
