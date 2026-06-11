import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Pagination from '../components/ui/Pagination'
import EmployeeModal from '../components/employees/EmployeeModal'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchEmployees, removeEmployee } from '../store/slices/employeesSlice'
import type { Employee } from '../types'

export default function EmployeesPage() {
  const dispatch = useAppDispatch()
  const isAdmin = useAppSelector((s) => s.auth.user?.role === 'admin')
  const { items, page, limit, total, loading, error } = useAppSelector((s) => s.employees)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchEmployees({ page: 1, limit: 10 }))
    }
  }, [dispatch, isAdmin])

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const openCreate = () => {
    setEditingEmployee(null)
    setModalOpen(true)
  }

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setModalOpen(true)
  }

  const handlePageChange = (nextPage: number) => {
    dispatch(fetchEmployees({ page: nextPage, limit }))
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header
        title="Employee Management"
        subtitle="Create, update, and manage employees"
        action={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Add Employee
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-8">
        {error ? <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {loading ? <p className="text-slate-500">Loading employees...</p> : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((employee) => (
                <tr key={employee._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.designation}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(employee)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch(removeEmployee(employee._id))}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && items.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No employees found. Add your first employee.</div>
          ) : null}
        </div>

        {total > 0 ? (
          <div className="mt-6">
            <Pagination page={page} limit={limit} total={total} onPageChange={handlePageChange} loading={loading} />
          </div>
        ) : null}
      </div>

      <EmployeeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingEmployee(null)
        }}
        employee={editingEmployee}
      />
    </div>
  )
}
