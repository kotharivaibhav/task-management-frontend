import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addEmployee, clearEmployeesError, editEmployee } from '../../store/slices/employeesSlice'
import type { Employee } from '../../types'

type Props = {
  open: boolean
  onClose: () => void
  employee?: Employee | null
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  salary: '',
  joiningDate: '',
  password: '',
}

export default function EmployeeModal({ open, onClose, employee }: Props) {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((s) => s.employees)
  const [form, setForm] = useState(emptyForm)
  const isEdit = Boolean(employee)

  useEffect(() => {
    if (employee) {
      setForm({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        salary: String(employee.salary),
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().slice(0, 10) : '',
        password: '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [employee, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department.trim(),
      designation: form.designation.trim(),
      salary: Number(form.salary),
      joiningDate: form.joiningDate,
      ...(form.password ? { password: form.password } : {}),
    }

    if (!isEdit && !form.password) return

    const result = isEdit && employee
      ? await dispatch(editEmployee({ id: employee._id, payload }))
      : await dispatch(addEmployee({ ...payload, password: form.password }))

    if ((isEdit ? editEmployee : addEmployee).fulfilled.match(result)) {
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Employee' : 'Add Employee'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">First Name</span>
            <input
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Last Name</span>
            <input
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Department</span>
            <input
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Designation</span>
            <input
              value={form.designation}
              onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Salary</span>
            <input
              type="number"
              min="0"
              value={form.salary}
              onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Joining Date</span>
            <input
              type="date"
              value={form.joiningDate}
              onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Password {isEdit ? '(optional)' : ''}
            </span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder={isEdit ? 'Leave blank to keep current password' : 'Min 8 characters'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required={!isEdit}
              minLength={8}
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              dispatch(clearEmployeesError())
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
            {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
