import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../api'
import TaskPage from './TaskPage'
import EmployeePage from './EmployeePage'

type Task = {
  _id: string
  title: string
  description: string
  status: string
  assignedTo?: string
  comments?: Array<{ userId: string; comment: string }>
}

type Employee = {
  _id: string
  firstName: string
  lastName: string
  email: string
  role?: string
}

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const [view, setView] = useState<'tasks' | 'employees'>('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const isAdmin = user?.role === 'admin'

  const pageTitle = useMemo(() => {
    if (view === 'employees') return 'Employee Directory'
    return isAdmin ? 'All Tasks' : 'Assigned Tasks'
  }, [view, isAdmin])

  const countLabel = useMemo(() => {
    if (view === 'employees') return `${employees.length} employees listed`
    return `${tasks.length} tasks found`
  }, [view, tasks.length, employees.length])

  const [fullPage, setFullPage] = useState<'none' | 'tasks' | 'employees'>('none')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const fetchData = async () => {
    if (!token) {
      setError('Authorization token missing. Please log in again.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      if (view === 'tasks') {
        const endpoint = isAdmin ? '/v1/tasks' : '/v1/tasks/assigned'
        const result = await apiRequest<{ data: { tasks: Task[]; page: number; limit: number; total: number } }>(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setTasks(result.data.tasks || [])
      } else {
        const result = await apiRequest<{ data: { employees: Employee[]; page: number; limit: number; total: number } }>(
          '/v1/employees?page=1&limit=10',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        setEmployees(result.data.employees || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [view, user?.role, refreshKey])

  const handleCloseModal = () => {
    setFullPage('none')
    setSelectedTaskId(null)
    setRefreshKey((current) => current + 1)
  }

  if (fullPage === 'tasks') return <TaskPage onClose={handleCloseModal} selectedTaskId={selectedTaskId} />
  if (fullPage === 'employees') return <EmployeePage onClose={handleCloseModal} />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>TM</span>
          <div>
            <strong>Task Manager</strong>
            <small>Role: {user?.role}</small>
          </div>
        </div>

        <nav>
          <button
            className={view === 'tasks' ? 'nav-button active' : 'nav-button'}
            onClick={() => setView('tasks')}
          >
            Tasks
          </button>
          {isAdmin ? (
            <button
              className={view === 'employees' ? 'nav-button active' : 'nav-button'}
              onClick={() => setView('employees')}
            >
              Employees
            </button>
          ) : null}
        </nav>

        <div className="sidebar-footer">
          <button className="secondary-button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{pageTitle}</h1>
            <p className="subtitle">Signed in as {user?.name} ({user?.email})</p>
            <p className="subtitle">{countLabel}</p>
          </div>
          <div className="dashboard-actions">
            {view === 'tasks' && isAdmin ? (
              <button className="primary-button" onClick={() => setFullPage('tasks')}>
                Task Manager
              </button>
            ) : null}
            {view === 'employees' && isAdmin ? (
              <button className="primary-button" onClick={() => setFullPage('employees')}>
                Employee Manager
              </button>
            ) : null}
            <button className="secondary-button" onClick={fetchData}>
              Refresh
            </button>
          </div>
        </header>

        <section className="content-panel">
          {loading && <p className="status-message">Loading…</p>}
          {error && <p className="status-error">{error}</p>}
          {!loading && !error && view === 'tasks' && (
            <div className="grid-list">
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <p>No tasks are available right now.</p>
                  <p>Try refreshing or check your backend connection.</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <article
                    key={task._id}
                    className="card summary-card clickable"
                    onClick={() => {
                      setSelectedTaskId(task._id)
                      setFullPage('tasks')
                    }}
                  >
                    <div className="card-top">
                      <h2>{task.title}</h2>
                      <span className={`badge status-${task.status.toLowerCase()}`}>{task.status}</span>
                    </div>
                    <p>{task.description}</p>
                    <div className="card-meta card-meta-compact">
                      <small>Assigned to: {task.assignedTo || 'Unassigned'}</small>
                      <small>{task.comments?.length ?? 0} comments</small>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {!loading && !error && view === 'employees' && (
            <div className="grid-list">
              {employees.length === 0 ? (
                <div className="empty-state">
                  <p>No employees available yet.</p>
                  <p>You can add them from the backend admin panel.</p>
                </div>
              ) : (
                employees.map((employee) => (
                  <article key={employee._id} className="card employee-card summary-card">
                    <div>
                      <h2>{`${employee.firstName} ${employee.lastName}`}</h2>
                      <p>{employee.email}</p>
                    </div>
                    <span className={`badge role-${(employee.role ?? 'Employee').toLowerCase()}`}>
                      {employee.role ?? 'Employee'}
                    </span>
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
