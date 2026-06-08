import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { apiRequest } from '../api'

type User = {
  _id: string
  name: string
  email: string
  role: string
}

type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)
const STORAGE_KEY = 'task-manager-auth'

function parseStorage() {
  const value = localStorage.getItem(STORAGE_KEY)
  if (!value) return null
  try {
    return JSON.parse(value) as { user: User; token: string }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = parseStorage()
    if (stored) {
      setUser(stored.user)
      setToken(stored.token)
    }
  }, [])

  useEffect(() => {
    if (user && token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user, token])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password.')
      }

      const authData = await apiRequest<{ data: { user: User; token: string } }>('/v1/users/login', {
        method: 'POST',
        body: { email, password },
      })

      setUser(authData.data.user)
      setToken(authData.data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setError(null)
  }

  const value = useMemo(
    () => ({ user, token, loading, error, login, logout }),
    [user, token, loading, error],
  )

  return <AuthContext.Provider value={value}>
    {children}
    </AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
