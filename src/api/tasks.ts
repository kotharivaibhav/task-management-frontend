import { apiRequest } from './http'

type TaskComment = {
  _id?: string
  message: string
  createdBy: string
  createdAt: string
}

type Task = {
  _id?: string
  title: string
  description: string
  assignedTo: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  dueDate: string
  comments?: TaskComment[]
}

type CreateTaskPayload = Omit<Task, '_id' | 'comments'>

export async function getTasks(token: string, page = 1, limit = 10) {
  return apiRequest<{ data: { tasks: Task[]; page: number; limit: number; total: number } }>(
    `/v1/tasks?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
}

export async function getAssignedTasks(token: string, page = 1, limit = 10) {
  return apiRequest<{ data: { tasks: Task[]; page: number; limit: number; total: number } }>(
    `/v1/tasks/assigned?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
}

export async function createTask(token: string, payload: CreateTaskPayload) {
  return apiRequest<{ data: Task }>('/v1/tasks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  })
}

export async function updateTaskStatus(token: string, id: string, status: Task['status']) {
  return apiRequest(`/v1/tasks/${id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: { status },
  })
}

export type UpdateTaskPayload = Partial<Pick<Task, 'title' | 'description' | 'assignedTo' | 'priority' | 'status' | 'dueDate'>>

export async function updateTask(token: string, id: string, payload: UpdateTaskPayload) {
  return apiRequest<{ data: Task }>(`/v1/tasks/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  })
}

export async function addTaskComment(token: string, id: string, comment: string) {
  return apiRequest(`/v1/tasks/${id}/comments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: { comment },
  })
}

export async function updateTaskComment(token: string, id: string, commentId: string, comment: string) {
  return apiRequest(`/v1/tasks/${id}/comments/${commentId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: { comment },
  })
}

export async function deleteTask(token: string, id: string) {
  return apiRequest(`/v1/tasks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export type { Task, CreateTaskPayload }
