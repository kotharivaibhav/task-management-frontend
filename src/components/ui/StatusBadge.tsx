import type { TaskStatus } from '../../types'

const styles: Record<TaskStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  )
}
