import { apiRequest } from './http'
import type { Profile, User } from '../types'

export async function loginRequest(email: string, password: string) {
  return apiRequest<{ data: { user: User; token: string } }>('/v1/users/login', {
    method: 'POST',
    body: { email, password },
  })
}

export async function getProfile(token: string) {
  return apiRequest<{ data: Profile }>('/v1/users/me', { token })
}

export async function updateProfile(
  token: string,
  payload: { name?: string; email?: string; password?: string },
) {
  return apiRequest<{ data: { user: User } }>('/v1/users/me', {
    method: 'PUT',
    token,
    body: payload,
  })
}
