import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  addTaskComment,
  createTask,
  deleteTask,
  getAssignedTasks,
  getTasks,
  updateTask,
  updateTaskComment,
  updateTaskStatus,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from '../../api/tasks'
import type { Task, TaskStatus } from '../../types'

type TasksState = {
  items: Task[]
  page: number
  limit: number
  total: number
  loading: boolean
  error: string | null
  selectedTask: Task | null
}

const initialState: TasksState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
  selectedTask: null,
}

function getToken(getState: () => unknown) {
  return (getState() as { auth: { token: string | null } }).auth.token
}

function getIsAdmin(getState: () => unknown) {
  return (getState() as { auth: { user: { role: string } | null } }).auth.user?.role === 'admin'
}

export const fetchTasks = createAsyncThunk(
  'tasks/fetch',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { getState, rejectWithValue }) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    try {
      const isAdmin = getIsAdmin(getState)
      const res = isAdmin ? await getTasks(token, page, limit) : await getAssignedTasks(token, page, limit)
      return res.data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load tasks')
    }
  },
)

export const addTask = createAsyncThunk(
  'tasks/create',
  async (payload: CreateTaskPayload, { getState, rejectWithValue, dispatch }) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    try {
      await createTask(token, payload)
      await dispatch(fetchTasks({ page: 1 }))
      return true
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create task')
    }
  },
)

export const editTask = createAsyncThunk(
  'tasks/update',
  async ({ id, payload }: { id: string; payload: UpdateTaskPayload }, { getState, rejectWithValue, dispatch }) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    const state = getState() as { tasks: TasksState }
    try {
      await updateTask(token, id, payload)
      await dispatch(fetchTasks({ page: state.tasks.page, limit: state.tasks.limit }))
      return true
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update task')
    }
  },
)

export const changeTaskStatus = createAsyncThunk(
  'tasks/status',
  async ({ id, status }: { id: string; status: TaskStatus }, { getState, rejectWithValue, dispatch }) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    const state = getState() as { tasks: TasksState }
    try {
      await updateTaskStatus(token, id, status)
      await dispatch(fetchTasks({ page: state.tasks.page, limit: state.tasks.limit }))
      return true
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update status')
    }
  },
)

export const removeTask = createAsyncThunk(
  'tasks/delete',
  async (id: string, { getState, rejectWithValue, dispatch }) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    const state = getState() as { tasks: TasksState }
    try {
      await deleteTask(token, id)
      await dispatch(fetchTasks({ page: state.tasks.page, limit: state.tasks.limit }))
      return true
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete task')
    }
  },
)

export const postComment = createAsyncThunk(
  'tasks/comment',
  async ({ taskId, comment }: { taskId: string; comment: string }, { getState, rejectWithValue, dispatch }) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    const state = getState() as { tasks: TasksState }
    try {
      await addTaskComment(token, taskId, comment)
      await dispatch(fetchTasks({ page: state.tasks.page, limit: state.tasks.limit }))
      return true
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to add comment')
    }
  },
)

export const editComment = createAsyncThunk(
  'tasks/editComment',
  async (
    { taskId, commentId, comment }: { taskId: string; commentId: string; comment: string },
    { getState, rejectWithValue, dispatch },
  ) => {
    const token = getToken(getState)
    if (!token) return rejectWithValue('Not authenticated')
    const state = getState() as { tasks: TasksState }
    try {
      await updateTaskComment(token, taskId, commentId, comment)
      await dispatch(fetchTasks({ page: state.tasks.page, limit: state.tasks.limit }))
      return true
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update comment')
    }
  },
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask(state, action) {
      state.selectedTask = action.payload
    },
    clearTasksError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.tasks
        state.page = action.payload.page
        state.limit = action.payload.limit
        state.total = action.payload.total
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addTask.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(editTask.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(changeTaskStatus.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(postComment.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(editComment.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { setSelectedTask, clearTasksError } = tasksSlice.actions
export default tasksSlice.reducer
