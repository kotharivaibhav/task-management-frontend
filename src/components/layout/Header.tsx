import { useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import ProfileModal from '../profile/ProfileModal'

type Props = {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function Header({ title, subtitle, action }: Props) {
  const user = useAppSelector((s) => s.auth.user)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          {action}
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs capitalize text-slate-500">{user?.role}</p>
            </div>
          </button>
        </div>
      </header>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
