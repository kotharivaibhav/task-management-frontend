import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
  type CreateEmployeePayload,
  type UpdateEmployeePayload,
} from '../../api/users'

type EmployeesState = {
  items: import('../../types').Employee[]
  page: number
  limit: number
  total: number
  loading: boolean
  error: string | null
}

const initialState: EmployeesState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
}

function getToken(getState: () => unknown) {
  return (getState() as { auth: { token: string | null } }).auth.token
}

export const fetchEmployees = createAsyncThunk(
  'employees/fetch',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { getState, rejectWithValue }) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    try {
      const res = await getEmployees(token, page, limit)
      return res.data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load employees')
    }
  },
)

export const addEmployee = createAsyncThunk(
  'employees/create',
  async (payload: CreateEmployeePayload, { getState, rejectWithValue, dispatch }) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    try {
      await createEmployee(token, payload)
      await dispatch(fetchEmployees({ page: 1 }))
      return true
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create employee')
    }
  },
)

export const editEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, payload }: { id: string; payload: UpdateEmployeePayload }, { getState, rejectWithValue, dispatch }) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    const state = getState() as { employees: EmployeesState }
    try {
      await updateEmployee(token, id, payload)
      await dispatch(fetchEmployees({ page: state.employees.page, limit: state.employees.limit }))
      return true
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update employee')
    }
  },
)

export const removeEmployee = createAsyncThunk(
  'employees/delete',
  async (id: string, { getState, rejectWithValue, dispatch }) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    const state = getState() as { employees: EmployeesState }
    try {
      await deleteEmployee(token, id)
      await dispatch(fetchEmployees({ page: state.employees.page, limit: state.employees.limit }))
      return true
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete employee')
    }
  },
)

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearEmployeesError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.employees
        state.page = action.payload.page
        state.limit = action.payload.limit
        state.total = action.payload.total
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(editEmployee.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(removeEmployee.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearEmployeesError } = employeesSlice.actions
export default employeesSlice.reducer
