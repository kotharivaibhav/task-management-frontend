import { useEffect, useMemo, useState } from 'react'
import Header from '../components/layout/Header'
import Pagination from '../components/ui/Pagination'
import StatusBadge from '../components/ui/StatusBadge'
import TaskModal from '../components/tasks/TaskModal'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchEmployees } from '../store/slices/employeesSlice'
import {
  changeTaskStatus,
  editComment,
  fetchTasks,
  postComment,
  removeTask,
} from '../store/slices/tasksSlice'
import type { Task, TaskStatus } from '../types'

export default function TasksPage() {
  const dispatch = useAppDispatch()
  const isAdmin = useAppSelector((s) => s.auth.user?.role === 'admin')
  const userId = useAppSelector((s) => s.auth.user?._id)
  const { items, page, limit, total, loading, error } = useAppSelector((s) => s.tasks)
  const employees = useAppSelector((s) => s.employees.items)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [statusDraft, setStatusDraft] = useState<Record<string, TaskStatus>>({})
  const [editingComment, setEditingComment] = useState<{ taskId: string; commentId: string; text: string } | null>(null)

  useEffect(() => {
    dispatch(fetchTasks({ page: 1, limit: 10 }))
    if (isAdmin) {
      dispatch(fetchEmployees({ page: 1, limit: 100 }))
    }
  }, [dispatch, isAdmin])

  const employeeMap = useMemo(() => {
    return employees.reduce<Record<string, string>>((map, emp) => {
      const key = emp.userId ?? emp._id
      map[key] = `${emp.firstName} ${emp.lastName}`
      return map
    }, {})
  }, [employees])

  const canUpdateTask = (task: Task) => {
    if (isAdmin) return true
    return String(task.assignedTo) === String(userId)
  }

  const openCreate = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handlePageChange = (nextPage: number) => {
    dispatch(fetchTasks({ page: nextPage, limit }))
  }

  const handleStatusUpdate = async (taskId: string) => {
    const status = statusDraft[taskId]
    if (!status) return
    await dispatch(changeTaskStatus({ id: taskId, status }))
  }

  const handleAddComment = async (taskId: string) => {
    const comment = commentText[taskId]?.trim()
    if (!comment) return
    await dispatch(postComment({ taskId, comment }))
    setCommentText((c) => ({ ...c, [taskId]: '' }))
  }

  const handleSaveComment = async () => {
    if (!editingComment) return
    await dispatch(
      editComment({
        taskId: editingComment.taskId,
        commentId: editingComment.commentId,
        comment: editingComment.text.trim(),
      }),
    )
    setEditingComment(null)
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header
        title={isAdmin ? 'Task Management' : 'My Tasks'}
        subtitle="Manage tasks, status, and comments"
        action={
          isAdmin ? (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              + Add Task
            </button>
          ) : null
        }
      />

      <div className="flex-1 overflow-y-auto p-8">
        {error ? <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {loading ? <p className="text-slate-500">Loading tasks...</p> : null}

        {!loading && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-medium text-slate-700">No tasks found</p>
            <p className="mt-1 text-sm text-slate-500">
              {isAdmin ? 'Create your first task to get started.' : 'No tasks have been assigned to you yet.'}
            </p>
          </div>
        ) : null}

        <div className="space-y-4">
          {items.map((task) => {
            const expanded = expandedId === task._id
            return (
              <article key={task._id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div
                  className="flex cursor-pointer flex-wrap items-start justify-between gap-4 p-5"
                  onClick={() => setExpandedId(expanded ? null : task._id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                      <StatusBadge status={task.status} />
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {task.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{task.description}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>Assigned: {employeeMap[task.assignedTo] ?? task.assignedTo}</span>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      <span>{task.comments?.length ?? 0} comments</span>
                    </div>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {canUpdateTask(task) ? (
                      <button
                        type="button"
                        onClick={() => openEdit(task)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    ) : null}
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => dispatch(removeTask(task._id))}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>

                {expanded ? (
                  <div className="border-t border-slate-100 px-5 py-4">
                    {canUpdateTask(task) ? (
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <select
                          value={statusDraft[task._id] ?? task.status}
                          onChange={(e) =>
                            setStatusDraft((s) => ({ ...s, [task._id]: e.target.value as TaskStatus }))
                          }
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(task._id)}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
                        >
                          Update Status
                        </button>
                      </div>
                    ) : null}

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-800">Comments</p>
                      {task.comments && task.comments.length > 0 ? (
                        <ul className="mb-4 space-y-3">
                          {task.comments.map((comment) => {
                            const commentId = comment._id ?? ''
                            const canEdit = isAdmin || String(comment.createdBy) === String(userId)
                            const inEdit =
                              editingComment?.taskId === task._id && editingComment?.commentId === commentId

                            return (
                              <li key={commentId || comment.createdAt} className="rounded-lg bg-white p-3">
                                {inEdit ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editingComment.text}
                                      onChange={(e) =>
                                        setEditingComment((c) => (c ? { ...c, text: e.target.value } : c))
                                      }
                                      rows={2}
                                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditingComment(null)}
                                        className="rounded-lg border px-3 py-1 text-sm"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleSaveComment}
                                        className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm text-slate-700">{comment.message}</p>
                                    <div className="mt-1 flex items-center justify-between">
                                      <small className="text-xs text-slate-400">
                                        {new Date(comment.createdAt).toLocaleString()}
                                      </small>
                                      {canEdit ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingComment({
                                              taskId: task._id,
                                              commentId,
                                              text: comment.message,
                                            })
                                          }
                                          className="text-xs text-indigo-600 hover:underline"
                                        >
                                          Edit
                                        </button>
                                      ) : null}
                                    </div>
                                  </>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        <p className="mb-4 text-sm text-slate-500">No comments yet.</p>
                      )}

                      {canUpdateTask(task) ? (
                        <div className="flex gap-2">
                          <input
                            value={commentText[task._id] ?? ''}
                            onChange={(e) => setCommentText((c) => ({ ...c, [task._id]: e.target.value }))}
                            placeholder="Write a comment..."
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(task._id)}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                          >
                            Add
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>

        {total > 0 ? (
          <div className="mt-6">
            <Pagination page={page} limit={limit} total={total} onPageChange={handlePageChange} loading={loading} />
          </div>
        ) : null}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
      />
    </div>
  )
}
