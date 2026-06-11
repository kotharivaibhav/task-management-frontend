import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <p className="text-7xl font-bold text-indigo-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
