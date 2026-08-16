import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon } from 'lucide-react'

export function DataTable({
  data,
  columns,
  className,
  onRowClick,
  sortable = true,
  filterable = true,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filters, setFilters] = useState({})

  const handleSort = (key) => {
    if (!sortable) return

    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const sortedAndFilteredData = useMemo(() => {
    let processedData = [...data]

    // Apply filters
    if (filterable) {
      Object.keys(filters).forEach(key => {
        const filterValue = filters[key]?.toLowerCase()
        if (filterValue) {
          processedData = processedData.filter(item =>
            String(item[key]).toLowerCase().includes(filterValue)
          )
        }
      })
    }

    // Apply sorting
    if (sortable && sortConfig.key) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return processedData
  }, [data, sortConfig, filters, sortable, filterable])

  const getSortIcon = (key) => {
    if (!sortable) return null
    if (sortConfig.key !== key) return <ChevronsUpDownIcon className="h-4 w-4 text-muted-foreground" />
    return sortConfig.direction === 'asc'
      ? <ChevronUpIcon className="h-4 w-4" />
      : <ChevronDownIcon className="h-4 w-4" />
  }

  return (
    <div className="relative overflow-x-auto">
      {filterable && (
        <div className="mb-4 flex flex-wrap gap-4">
          {columns.map(column => (
            <input
              key={column.key}
              type="text"
              placeholder={`Filter ${column.label}...`}
              className="rounded-md border px-3 py-1 text-sm"
              onChange={(e) => handleFilter(column.key, e.target.value)}
            />
          ))}
        </div>
      )}

      <table className={cn(
        "w-full text-sm text-left rtl:text-right",
        className
      )}>
        <thead className="text-xs uppercase bg-muted/50">
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={cn(
                  "px-6 py-3",
                  sortable && "cursor-pointer hover:bg-muted"
                )}
                onClick={() => handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedAndFilteredData.map((row, index) => (
            <tr
              key={index}
              className={cn(
                "border-b",
                "hover:bg-muted/50",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(column => (
                <td key={column.key} className="px-6 py-4">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}