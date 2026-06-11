import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const isAdmin = user?.role === 'admin'

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
            TM
          </div>
          <div>
            <p className="font-semibold text-slate-900">TaskFlow</p>
            <p className="text-xs capitalize text-slate-500">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        <NavLink to="/dashboard" className={linkClass}>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to="/tasks" className={linkClass}>
          <span>✅</span> Tasks
        </NavLink>
        {isAdmin ? (
          <NavLink to="/employees" className={linkClass}>
            <span>👥</span> Employees
          </NavLink>
        ) : null}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
