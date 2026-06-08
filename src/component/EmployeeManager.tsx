import { useEffect, useState } from 'react'
import {
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
  type Employee,
  type CreateEmployeePayload,
  type UpdateEmployeePayload,
} from '../api/users'

type Props = { token: string }

export default function EmployeeManager({ token }: Props) {
  const [items, setItems] = useState<Employee[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [designation, setDesignation] = useState('')
  const [salary, setSalary] = useState('')
  const [joiningDate, setJoiningDate] = useState('')
  const [password, setPassword] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = async (targetPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getEmployees(token, targetPage, limit)
      setItems(res.data.employees || [])
      setPage(res.data.page)
      setTotal(res.data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setDepartment('')
    setDesignation('')
    setSalary('')
    setJoiningDate('')
    setPassword('')
    setEditingId(null)
    setError(null)
  }

  const handleEdit = (employee: Employee) => {
    setFirstName(employee.firstName)
    setLastName(employee.lastName)
    setEmail(employee.email)
    setPhone(employee.phone)
    setDepartment(employee.department)
    setDesignation(employee.designation)
    setSalary(employee.salary?.toString() ?? '')
    setJoiningDate(employee.joiningDate ? new Date(employee.joiningDate).toISOString().slice(0, 10) : '')
    setPassword('')
    setEditingId(employee._id ?? null)
    setError(null)
  }

  const handleSubmit = async () => {
    const requiredFields = [firstName, lastName, email, phone, department, designation, salary, joiningDate]
    if (requiredFields.some((value) => !value.trim())) {
      setError('Please complete all fields before saving.')
      return
    }

    if (!password.trim()) {
      setError('Password is required when creating or updating an employee.')
      return
    }

    const payload: UpdateEmployeePayload = {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      salary: Number(salary),
      joiningDate,
      password,
    }

    try {
      if (editingId) {
        await updateEmployee(token, editingId, payload)
      } else {
        await createEmployee(token, payload as CreateEmployeePayload)
      }
      resetForm()
      await load(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    try {
      await deleteEmployee(token, id)
      if (page > 1 && items.length === 1) {
        await load(page - 1)
      } else {
        await load(page)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div>
      <section className="form-grid" style={{ marginBottom: 24 }}>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" />
        <input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Designation" />
        <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Salary" type="number" />
        <input value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} placeholder="Joining date" type="date" />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={editingId ? 'Password (required to save)' : 'Password'}
          type="password"
        />
      </section>

      <div className="action-row" style={{ marginBottom: 16 }}>
        <button className="primary-button" onClick={handleSubmit}>
          {editingId ? 'Update Employee' : 'Create Employee'}
        </button>
        {editingId ? (
          <button className="secondary-button" onClick={resetForm}>
            Cancel
          </button>
        ) : null}
        <button className="secondary-button" onClick={() => load(page)}>
          Refresh
        </button>
      </div>

      <div className="action-row" style={{ marginBottom: 16, gap: 12 }}>
        <button disabled={loading || page <= 1} className="secondary-button" onClick={() => load(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} / {Math.max(1, Math.ceil(total / limit))}
        </span>
        <button disabled={loading || page >= Math.ceil(total / limit)} className="secondary-button" onClick={() => load(page + 1)}>
          Next
        </button>
      </div>

      {loading && <p className="status-message">Loading…</p>}
      {error && <p className="status-error">{error}</p>}

      <div className="grid-list">
        {items.map((employee) => (
          <article
            key={employee._id}
            className="card employee-card clickable"
            onClick={() => handleEdit(employee)}
          >
            <div className="card-top">
              <div>
                <h2>{`${employee.firstName} ${employee.lastName}`}</h2>
                <p>{employee.email}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="secondary-button"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleEdit(employee)
                  }}
                >
                  Edit
                </button>
                <button
                  className="secondary-button"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleDelete(employee._id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="card-meta" style={{ flexDirection: 'column', gap: 6 }}>
              <small>Department: {employee.department}</small>
              <small>Designation: {employee.designation}</small>
              <small>Phone: {employee.phone}</small>
              <small>Salary: {employee.salary}</small>
              <small>Joined: {new Date(employee.joiningDate).toLocaleDateString()}</small>
              <small>Role: {employee.role ?? 'Employee'}</small>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
