import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = (): (number | string)[] => {
    const range: (number | string)[] = []
    const delta = 1 // Numbers around current

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      } else if (range[range.length - 1] !== '...') {
        range.push('...')
      }
    }
    return range
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 rounded-2xl border border-brand-dark-border bg-brand-dark-card/40 backdrop-blur-md shadow-lg animate-fadeIn">
      <div className="text-xs font-medium text-slate-400">
        Mostrando{' '}
        <span className="font-semibold text-slate-200">
          {startItem}-{endItem}
        </span>{' '}
        de <span className="font-semibold text-brand-primary-light">{totalItems}</span> vehículos
      </div>

      <div className="flex items-center gap-1.5">
        {/* First page button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-dark-border bg-brand-dark-deep/40 text-slate-400 hover:text-white hover:border-brand-primary/40 hover:bg-brand-dark-hover/30 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-brand-dark-border disabled:hover:bg-brand-dark-deep/40 transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95"
          title="Primera Página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-dark-border bg-brand-dark-deep/40 text-slate-400 hover:text-white hover:border-brand-primary/40 hover:bg-brand-dark-hover/30 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-brand-dark-border disabled:hover:bg-brand-dark-deep/40 transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95"
          title="Página Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${idx}`}
                className="px-1 text-slate-500 text-sm font-semibold selection:bg-transparent"
              >
                ...
              </span>
            )
          }

          const isCurrent = page === currentPage
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                isCurrent
                  ? 'bg-gradient-to-r from-brand-primary-hover to-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'border border-brand-dark-border bg-brand-dark-deep/20 text-slate-400 hover:text-white hover:border-brand-primary/40 hover:bg-brand-dark-hover/30'
              }`}
            >
              {page}
            </button>
          )
        })}

        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-dark-border bg-brand-dark-deep/40 text-slate-400 hover:text-white hover:border-brand-primary/40 hover:bg-brand-dark-hover/30 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-brand-dark-border disabled:hover:bg-brand-dark-deep/40 transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95"
          title="Página Siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-dark-border bg-brand-dark-deep/40 text-slate-400 hover:text-white hover:border-brand-primary/40 hover:bg-brand-dark-hover/30 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-brand-dark-border disabled:hover:bg-brand-dark-deep/40 transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95"
          title="Última Página"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
