import TaskManager from './TaskManager'
import { useAuth } from '../context/AuthContext'

type Props = { onClose?: () => void; selectedTaskId?: string | null }

export default function TaskPage({ onClose, selectedTaskId }: Props) {
  const { token } = useAuth()
  if (!token) return <p>Unauthorized</p>

  return (
    <div className="full-page" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div>
            <p className="eyebrow">Task Center</p>
            <h2>Task management</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close task modal">
            ×
          </button>
        </header>

        <main className="modal-content">
          <TaskManager token={token} initialExpandId={selectedTaskId} />
        </main>
      </div>
    </div>
  )
}
