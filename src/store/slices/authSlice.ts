import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getProfile, loginRequest, updateProfile } from '../../api/auth'
import { updateEmployee } from '../../api/users'
import type { Employee, Profile, User } from '../../types'

const STORAGE_KEY = 'task-manager-auth'

type AuthState = {
  user: User | null
  token: string | null
  profile: Profile | null
  loading: boolean
  error: string | null
  initialized: boolean
}

function loadStoredAuth(): Pick<AuthState, 'user' | 'token'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, token: null }
    const parsed = JSON.parse(raw) as { user: User; token: string }
    return { user: parsed.user, token: parsed.token }
  } catch {
    return { user: null, token: null }
  }
}

const stored = loadStoredAuth()

const initialState: AuthState = {
  user: stored.user,
  token: stored.token,
  profile: null,
  loading: false,
  error: null,
  initialized: false,
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await loginRequest(email, password)
      return res.data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Login failed')
    }
  },
)

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { getState, rejectWithValue }) => {
  const state = getState() as { auth: AuthState }
  if (!state.auth.token) return rejectWithValue('Not authenticated')
  try {
    const res = await getProfile(state.auth.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to load profile')
  }
})

export const saveProfile = createAsyncThunk(
  'auth/saveProfile',
  async (
    payload: {
      name?: string
      email?: string
      password?: string
      employee?: Partial<Employee> & { password?: string }
    },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as { auth: AuthState }
    const token = state.auth.token
    if (!token) return rejectWithValue('Not authenticated')

    try {
      const userRes = await updateProfile(token, {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      })

      let employee = state.auth.profile?.employee
      if (payload.employee && employee?._id) {
        const empRes = await updateEmployee(token, employee._id, payload.employee)
        employee = empRes.data
      }

      return { user: userRes.data.user, employee }
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update profile')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.profile = null
      state.error = null
      localStorage.removeItem(STORAGE_KEY)
    },
    clearError(state) {
      state.error = null
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload))
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.user = null
        state.token = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload
        state.user = action.payload.user
        state.initialized = true
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.initialized = true
      })
      .addCase(saveProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.profile = {
          user: action.payload.user,
          employee: action.payload.employee ?? state.profile?.employee,
        }
        if (state.token) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: action.payload.user, token: state.token }))
        }
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError, setInitialized } = authSlice.actions
export default authSlice.reducer
