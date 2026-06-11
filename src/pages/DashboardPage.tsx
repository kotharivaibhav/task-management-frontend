import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchDashboardStats } from '../store/slices/dashboardSlice'

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { stats, loading, error } = useAppSelector((s) => s.dashboard)
  const isAdmin = useAppSelector((s) => s.auth.user?.role === 'admin')

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  return (
    <div className="flex flex-1 flex-col">
      <Header
        title="Dashboard"
        subtitle={isAdmin ? 'Overview of employees and tasks' : 'Your task overview'}
      />

      <div className="flex-1 overflow-y-auto p-8">
        {loading ? <p className="text-slate-500">Loading dashboard...</p> : null}
        {error ? <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {stats ? (
          <>
            <div className={`mb-8 grid gap-4 ${isAdmin ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
              {isAdmin ? (
                <StatCard label="Total Employees" value={stats.totalEmployees ?? 0} color="text-indigo-600" />
              ) : null}
              <StatCard label="Total Tasks" value={stats.totalTasks} color="text-slate-900" />
              <StatCard label="Pending" value={stats.tasksByStatus.pending} color="text-amber-600" />
              <StatCard label="In Progress" value={stats.tasksByStatus.inProgress} color="text-blue-600" />
              <StatCard label="Completed" value={stats.tasksByStatus.completed} color="text-emerald-600" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to="/tasks"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <p className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600">Manage Tasks</p>
                <p className="mt-1 text-sm text-slate-500">View, edit, and update task status</p>
              </Link>
              {isAdmin ? (
                <Link
                  to="/employees"
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                >
                  <p className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600">Manage Employees</p>
                  <p className="mt-1 text-sm text-slate-500">Create, update, and remove employees</p>
                </Link>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
