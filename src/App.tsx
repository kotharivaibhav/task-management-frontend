import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './component/Dashboard'
import LoginPage from './component/LoginPage'
import './App.css'

function AppContent() {
  const { user } = useAuth()
  return user ? <Dashboard /> : <LoginPage />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
