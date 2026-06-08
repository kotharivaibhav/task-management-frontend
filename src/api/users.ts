import { apiRequest } from './http'

type Employee = {
  _id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  designation: string
  salary: number
  joiningDate: string
  userId?: string
  role?: string
}

type CreateEmployeePayload = Omit<Employee, '_id' | 'role' | 'userId'> & {
  password: string
}

type UpdateEmployeePayload = Partial<CreateEmployeePayload>

export async function getEmployees(token: string, page = 1, limit = 10) {
  return apiRequest<{ data: { employees: Employee[]; page: number; limit: number; total: number } }>(
    `/v1/employees?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
}

export async function createEmployee(token: string, payload: CreateEmployeePayload) {
  return apiRequest<{ data: Employee }>('/v1/employees', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  })
}

export async function updateEmployee(token: string, id: string, payload: Partial<CreateEmployeePayload>) {
  return apiRequest<{ data: Employee }>(`/v1/employees/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  })
}

export async function deleteEmployee(token: string, id: string) {
  return apiRequest(`/v1/employees/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export type { Employee, CreateEmployeePayload, UpdateEmployeePayload }
