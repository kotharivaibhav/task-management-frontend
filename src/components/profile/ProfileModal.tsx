import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearError, fetchProfile, saveProfile } from '../../store/slices/authSlice'

type Props = {
  open: boolean
  onClose: () => void
}

export default function ProfileModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const { user, profile, loading, error } = useAppSelector((s) => s.auth)
  const isEmployee = user?.role === 'employee'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [designation, setDesignation] = useState('')

  useEffect(() => {
    if (open) {
      dispatch(fetchProfile())
    }
  }, [open, dispatch])

  useEffect(() => {
    if (profile) {
      setName(profile.user.name)
      setEmail(profile.user.email)
      if (profile.employee) {
        setFirstName(profile.employee.firstName)
        setLastName(profile.employee.lastName)
        setPhone(profile.employee.phone)
        setDepartment(profile.employee.department)
        setDesignation(profile.employee.designation)
      }
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(
      saveProfile({
        name,
        email,
        password: password || undefined,
        employee: isEmployee
          ? {
              firstName,
              lastName,
              phone,
              department,
              designation,
              password: password || undefined,
            }
          : undefined,
      }),
    )
    if (saveProfile.fulfilled.match(result)) {
      setPassword('')
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile" wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
        </div>

        {isEmployee ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">First Name</span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Last Name</span>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Department</span>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Designation</span>
              <input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </label>
          </div>
        ) : null}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">New Password (optional)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            minLength={8}
          />
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              dispatch(clearError())
              onClose()
            }}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
