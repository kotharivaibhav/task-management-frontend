import { apiRequest } from './http'
import type { Employee } from '../types'

type CreateEmployeePayload = Omit<Employee, '_id' | 'userId'> & { password: string }
type UpdateEmployeePayload = Partial<CreateEmployeePayload>

export async function getEmployees(token: string, page = 1, limit = 10) {
  return apiRequest<{ data: { employees: Employee[]; page: number; limit: number; total: number } }>(
    `/v1/employees?page=${page}&limit=${limit}`,
    { token },
  )
}

export async function createEmployee(token: string, payload: CreateEmployeePayload) {
  return apiRequest<{ data: Employee }>('/v1/employees', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function updateEmployee(token: string, id: string, payload: UpdateEmployeePayload) {
  return apiRequest<{ data: Employee }>(`/v1/employees/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  })
}

export async function deleteEmployee(token: string, id: string) {
  return apiRequest(`/v1/employees/${id}`, {
    method: 'DELETE',
    token,
  })
}

export type { CreateEmployeePayload, UpdateEmployeePayload }
