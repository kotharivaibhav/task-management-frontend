import EmployeeManager from './EmployeeManager'
import { useAuth } from '../context/AuthContext'

type Props = { onClose?: () => void }

export default function EmployeePage({ onClose }: Props) {
  const { token } = useAuth()
  if (!token) return <p>Unauthorized</p>

  return (
    <div className="full-page" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div>
            <p className="eyebrow">Employee Hub</p>
            <h2>Employee management</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close employee modal">
            ×
          </button>
        </header>

        <main className="modal-content">
          <EmployeeManager token={token} />
        </main>
      </div>
    </div>
  )
}
