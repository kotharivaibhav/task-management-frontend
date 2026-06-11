import { apiRequest } from './http'
import type { Task, TaskPriority, TaskStatus } from '../types'

type CreateTaskPayload = {
  title: string
  description: string
  assignedTo: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
}

type UpdateTaskPayload = Partial<CreateTaskPayload>

export async function getTasks(token: string, page = 1, limit = 10) {
  return apiRequest<{ data: { tasks: Task[]; page: number; limit: number; total: number } }>(
    `/v1/tasks?page=${page}&limit=${limit}`,
    { token },
  )
}

export async function getAssignedTasks(token: string, page = 1, limit = 10) {
  return apiRequest<{ data: { tasks: Task[]; page: number; limit: number; total: number } }>(
    `/v1/tasks/assigned?page=${page}&limit=${limit}`,
    { token },
  )
}

export async function createTask(token: string, payload: CreateTaskPayload) {
  return apiRequest<{ data: Task }>('/v1/tasks', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function updateTask(token: string, id: string, payload: UpdateTaskPayload) {
  return apiRequest<{ data: Task }>(`/v1/tasks/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  })
}

export async function updateTaskStatus(token: string, id: string, status: TaskStatus) {
  return apiRequest(`/v1/tasks/${id}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  })
}

export async function addTaskComment(token: string, id: string, comment: string) {
  return apiRequest(`/v1/tasks/${id}/comments`, {
    method: 'POST',
    token,
    body: { comment },
  })
}

export async function updateTaskComment(token: string, id: string, commentId: string, comment: string) {
  return apiRequest(`/v1/tasks/${id}/comments/${commentId}`, {
    method: 'PATCH',
    token,
    body: { comment },
  })
}

export async function deleteTask(token: string, id: string) {
  return apiRequest(`/v1/tasks/${id}`, {
    method: 'DELETE',
    token,
  })
}

export type { CreateTaskPayload, UpdateTaskPayload }
