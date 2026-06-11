import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getDashboardStats } from '../../api/dashboard'
import type { DashboardStats } from '../../types'

type DashboardState = {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
}

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } }
    if (!state.auth.token) return rejectWithValue('Not authenticated')
    try {
      const res = await getDashboardStats(state.auth.token)
      return res.data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load dashboard')
    }
  },
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard(state) {
      state.stats = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
