import { apiRequest } from './http'
import type { DashboardStats } from '../types'

export async function getDashboardStats(token: string) {
  return apiRequest<{ data: DashboardStats }>('/v1/dashboard/stats', { token })
}
