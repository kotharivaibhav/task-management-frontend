import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getTasks,
  getAssignedTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  addTaskComment,
  updateTaskComment,
  deleteTask,
  type Task,
} from '../api/tasks'
import { getEmployees, type Employee } from '../api/users'

type Props = { token: string; initialExpandId?: string | null }

export default function TaskManager({ token, initialExpandId }: Props) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<Task['status']>('Pending')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [editingComment, setEditingComment] = useState<{ taskId: string; commentId: string } | null>(null)
  const [editedCommentText, setEditedCommentText] = useState('')
  const [statusUpdates, setStatusUpdates] = useState<Record<string, Task['status']>>({})

  const employeeMap = useMemo(() => {
    return employees.reduce<Record<string, string>>((map, employee) => {
      const key = employee.userId ?? employee._id
      if (key) {
        map[key] = `${employee.firstName} ${employee.lastName}`
      }
      return map
    }, {})
  }, [employees])

  const canUpdateTask = (task: Task) => {
    if (isAdmin) return true
    const uid = String(user?._id ?? (user as any)?.id ?? '')
    const assigned = String(task.assignedTo ?? '')

    // direct match (task.assignedTo stores the user id)
    if (assigned && assigned === uid) return true

    // handle case where task.assignedTo stores an employee record id
    const emp = employees.find((e) => String(e._id) === assigned)
    if (emp && String(emp.userId) === uid) return true

    // fallback: maybe assigned stores the employee.userId value as ObjectId string
    const empByUser = employees.find((e) => String(e.userId) === assigned)
    if (empByUser && String(empByUser.userId) === uid) return true

    return false
  }

  const loadEmployees = async () => {
    try {
      const res = await getEmployees(token, 1, 100)
      setEmployees(res.data.employees || [])
    } catch (err) {
      console.warn('Unable to load employee list:', err)
    }
  }

  const load = async (targetPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = isAdmin
        ? await getTasks(token, targetPage, limit)
        : await getAssignedTasks(token, targetPage, limit)

      setTasks(res.data.tasks || [])
      setPage(res.data.page)
      setTotal(res.data.total)

      if (isAdmin) {
        await loadEmployees()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [isAdmin])

  useEffect(() => {
    if (initialExpandId) setExpandedTaskId(initialExpandId)
  }, [initialExpandId])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setAssignedTo('')
    setPriority('Medium')
    setDueDate('')
    setStatus('Pending')
    setEditingId(null)
    setError(null)
  }

  const handleEdit = (task: Task) => {
    setTitle(task.title)
    setDescription(task.description)
    setAssignedTo(task.assignedTo)
    setPriority(task.priority)
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '')
    setStatus(task.status)
    setEditingId(task._id ?? null)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !assignedTo || !dueDate) {
      setError('Please provide title, description, assigned employee, and due date.')
      return
    }

    try {
      if (editingId) {
        await updateTask(token, editingId, {
          title: title.trim(),
          description: description.trim(),
          assignedTo,
          priority,
          status,
          dueDate,
        })
      } else {
        if (!isAdmin) {
          setError('Only admins can create tasks.')
          return
        }

        await createTask(token, {
          title: title.trim(),
          description: description.trim(),
          assignedTo,
          priority,
          status,
          dueDate,
        })
      }
      resetForm()
      await load(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    try {
      await deleteTask(token, id)
      await load(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleStatusChange = async (id: string, newStatus: Task['status']) => {
    if (!newStatus) return
    try {
      await updateTaskStatus(token, id, newStatus)
      await load(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleCommentSubmit = async (taskId: string) => {
    const comment = commentText[taskId]
    if (!comment?.trim()) {
      return
    }

    try {
      await addTaskComment(token, taskId, comment.trim())
      setCommentText((current) => ({ ...current, [taskId]: '' }))
      await load(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const toggleTaskDetails = (taskId: string | undefined) => {
    if (!taskId) return
    setExpandedTaskId((current) => (current === taskId ? null : taskId))
  }

  const startCommentEdit = (taskId: string, commentId: string, message: string) => {
    setEditingComment({ taskId, commentId })
    setEditedCommentText(message)
    setError(null)
  }

  const cancelCommentEdit = () => {
    setEditingComment(null)
    setEditedCommentText('')
  }

  const saveCommentEdit = async () => {
    if (!editingComment) return
    if (!editedCommentText.trim()) {
      setError('Comment cannot be empty.')
      return
    }

    try {
      await updateTaskComment(token, editingComment.taskId, editingComment.commentId, editedCommentText.trim())
      cancelCommentEdit()
      await load(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div>
      {(!isAdmin && !editingId) ? (
        <p className="status-message">Employees can edit their assigned tasks from the task cards below.</p>
      ) : (
        <section className="form-grid" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">{editingId ? 'Edit Task' : 'Create Task'}</p>
            <h2>{editingId ? 'Update existing task' : 'Create a new task'}</h2>
          </div>
          {editingId ? (
            <button className="secondary-button" onClick={resetForm}>
              Cancel Edit
            </button>
          ) : null}
        </div>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
          rows={3}
        />
        {isAdmin ? (
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee.userId ?? employee._id}>
                {`${employee.firstName} ${employee.lastName}`}
              </option>
            ))}
          </select>
        ) : (
          <input value={employeeMap[assignedTo] ?? assignedTo} readOnly />
        )}
        <div className="form-grid-small">
          <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} disabled={!isAdmin}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" />
        </div>

        <div className="action-row" style={{ marginBottom: 16 }}>
          <button className="primary-button" onClick={handleSubmit}>
            {editingId ? 'Save Changes' : 'Create Task'}
          </button>
          <button className="secondary-button" onClick={() => load(page)}>
            Refresh list
          </button>
        </div>
      </section>
      )}
      <div className="action-row" style={{ marginBottom: 16, gap: 12 }}>
        <button disabled={loading || page <= 1} className="secondary-button" onClick={() => load(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} / {Math.max(1, Math.ceil(total / limit))}
        </span>
        <button disabled={loading || page >= Math.ceil(total / limit)} className="secondary-button" onClick={() => load(page + 1)}>
          Next
        </button>
      </div>

      {loading && <p className="status-message">Loading…</p>}
      {error && <p className="status-error">{error}</p>}

      <div className="grid-list">
        {tasks.map((task) => {
          const taskId = task._id ?? ''
          const expanded = expandedTaskId === taskId
          return (
            <article
              key={taskId}
              className={`card task-card clickable ${expanded ? 'expanded' : ''}`}
              onClick={() => toggleTaskDetails(taskId)}
              aria-expanded={expanded}
            >
              <div className="card-top">
                <div>
                  <h2>{task.title}</h2>
                  <p>{task.description}</p>
                </div>
                <span className={`badge status-${task.status.toLowerCase().replace(/ /g, '-')}`}>
                  {task.status}
                </span>
              </div>

              <div className="card-meta card-meta-columns">
                <small>Assigned to: {employeeMap[task.assignedTo] ?? task.assignedTo}</small>
                <small>Priority: {task.priority}</small>
                <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                <small>{task.comments?.length ?? 0} comments</small>
              </div>

              {!expanded ? (
                <div className="card-summary-note">
                  Click card to view task details, comments, and actions.
                </div>
              ) : (
                <>
                  <div className="card-actions">
                    {canUpdateTask(task) ? (
                      <button
                        className="secondary-button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleEdit(task)
                        }}
                      >
                        Edit
                      </button>
                    ) : null}
                    {canUpdateTask(task) ? (
                      <div className="status-block">
                        <select
                          value={statusUpdates[taskId] ?? task.status}
                          onChange={(event) => {
                            event.stopPropagation()
                            const newStatus = event.target.value as Task['status']
                            setStatusUpdates((current) => ({ ...current, [taskId]: newStatus }))
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <button
                          className="secondary-button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleStatusChange(taskId, statusUpdates[taskId] ?? task.status)
                          }}
                        >
                          Update Status
                        </button>
                      </div>
                    ) : null}
                    {isAdmin ? (
                      <button
                        className="secondary-button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDelete(taskId)
                        }}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>

                  <div className="comment-panel">
                    <div className="comment-panel-header">
                      <strong>Comments</strong>
                      <small>{task.comments?.length ?? 0} entries</small>
                    </div>
                    {task.comments && task.comments.length > 0 ? (
                      <ul className="comment-list">
                        {task.comments.map((comment) => {
                          const commentId = comment._id ?? ''
                          const uid = String(user?._id ?? (user as any)?.id ?? '')
                          const creator = String(comment.createdBy ?? '')
                          const canEditComment = isAdmin || creator === uid
                          const inEditMode = editingComment?.taskId === taskId && editingComment?.commentId === commentId
                          return (
                            <li key={commentId || `${comment.createdBy}-${comment.createdAt}`} className="comment-item">
                              {inEditMode ? (
                                <div className="comment-edit-row" onClick={(event) => event.stopPropagation()}>
                                  <textarea
                                    value={editedCommentText}
                                    onChange={(event) => setEditedCommentText(event.target.value)}
                                    rows={2}
                                  />
                                  <div className="comment-edit-actions">
                                    <button className="secondary-button" onClick={cancelCommentEdit}>
                                      Cancel
                                    </button>
                                    <button className="primary-button" onClick={saveCommentEdit}>
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p>{comment.message}</p>
                                  <small>
                                    By {comment.createdBy} • {new Date(comment.createdAt).toLocaleString()}
                                  </small>
                                  {canEditComment ? (
                                    <button
                                      className="secondary-button comment-edit-button"
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        startCommentEdit(taskId, commentId, comment.message)
                                      }}
                                    >
                                      Edit
                                    </button>
                                  ) : null}
                                </>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="empty-note">No comments yet. Add one below.</p>
                    )}
                    <div className="comment-form" onClick={(event) => event.stopPropagation()}>
                      <input
                        value={commentText[taskId] ?? ''}
                        onChange={(event) => setCommentText((current) => ({ ...current, [taskId]: event.target.value }))}
                        placeholder="Write a comment..."
                      />
                      <button className="secondary-button" onClick={() => handleCommentSubmit(taskId)}>
                        Add Comment
                      </button>
                    </div>
                  </div>
                </>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
