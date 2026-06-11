export type UserRole = 'admin' | 'employee'

export type User = {
  _id: string
  name: string
  email: string
  role: UserRole
}

export type Employee = {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  designation: string
  salary: number
  joiningDate: string
  userId?: string
}

export type TaskComment = {
  _id?: string
  message: string
  createdBy: string
  createdAt: string
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed'
export type TaskPriority = 'Low' | 'Medium' | 'High'

export type Task = {
  _id: string
  title: string
  description: string
  assignedTo: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  comments?: TaskComment[]
  createdBy?: string
}

export type DashboardStats = {
  totalEmployees?: number
  totalTasks: number
  tasksByStatus: {
    pending: number
    inProgress: number
    completed: number
  }
}

export type Profile = {
  user: User
  employee?: Employee
}

export type PaginatedResponse<T> = {
  items: T[]
  page: number
  limit: number
  total: number
}
