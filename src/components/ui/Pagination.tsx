type Props = {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export default function Pagination({ page, limit, total, onPageChange, loading }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
      <p className="text-sm text-slate-500">
        Showing page {page} of {totalPages} ({total} total)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
