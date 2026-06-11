import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

export default function ProtectedRoute() {
  const token = useAppSelector((s) => s.auth.token)
  const user = useAppSelector((s) => s.auth.user)

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
