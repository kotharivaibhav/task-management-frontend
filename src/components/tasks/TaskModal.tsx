import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addTask, clearTasksError, editTask } from '../../store/slices/tasksSlice'
import { fetchEmployees } from '../../store/slices/employeesSlice'
import type { Task, TaskPriority, TaskStatus } from '../../types'

type Props = {
  open: boolean
  onClose: () => void
  task?: Task | null
}

const emptyForm = {
  title: '',
  description: '',
  assignedTo: '',
  priority: 'Medium' as TaskPriority,
  status: 'Pending' as TaskStatus,
  dueDate: '',
}

export default function TaskModal({ open, onClose, task }: Props) {
  const dispatch = useAppDispatch()
  const isAdmin = useAppSelector((s) => s.auth.user?.role === 'admin')
  const { loading, error } = useAppSelector((s) => s.tasks)
  const employees = useAppSelector((s) => s.employees.items)

  const [form, setForm] = useState(emptyForm)
  const isEdit = Boolean(task)

  useEffect(() => {
    if (open && isAdmin) {
      dispatch(fetchEmployees({ page: 1, limit: 100 }))
    }
  }, [open, isAdmin, dispatch])

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [task, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.assignedTo || !form.dueDate) return

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: form.assignedTo,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate,
    }

    const result = isEdit && task
      ? await dispatch(editTask({ id: task._id, payload }))
      : await dispatch(addTask(payload))

    if ((isEdit ? editTask : addTask).fulfilled.match(result)) {
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Task' : 'Create Task'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Title</span>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          {isAdmin ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Assign To</span>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.userId ?? emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Priority</span>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
              disabled={!isAdmin && isEdit}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Due Date</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              dispatch(clearTasksError())
              onClose()
            }}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
