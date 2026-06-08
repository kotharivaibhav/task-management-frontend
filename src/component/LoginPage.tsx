import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await login(email, password)
  }

  return (
    <main className="page-shell login-shell">
      <section className="login-card">
        <div className="login-header">
          <p className="pill">Task Management</p>
          <h1>Sign in to continue</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@gmail.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Admin@123"
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error ? <p className="form-error">{error}</p> : null}
        </form>

        <div className="login-helpers">
          <p>
            Admin credentials: <strong>admin@gmail.com / Admin@123</strong>
          </p>
          <p>Employee login will show assigned tasks only.</p>
        </div>
      </section>
    </main>
  )
}
