import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearError, login } from '../store/slices/authSlice'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useAppSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg">
            TM
          </div>
          <h1 className="text-3xl font-bold text-slate-900">TaskFlow</h1>
          <p className="mt-2 text-slate-500">Sign in to manage your tasks</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50"
        >
          {error ? (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                dispatch(clearError())
                setEmail(e.target.value)
              }}
              placeholder="admin@gmail.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              required
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                dispatch(clearError())
                setPassword(e.target.value)
              }}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Demo: admin@gmail.com / Admin@123
          </p>
        </form>
      </div>
    </div>
  )
}
