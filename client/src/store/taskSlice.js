import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosInstance";

export const fetchTasks = createAsyncThunk("tasks/fetchAll", async (_, { rejectWithValue }) => {
  try { const res = await api.get("/tasks?limit=100"); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createTask = createAsyncThunk("tasks/create", async (taskData, { rejectWithValue }) => {
  try { const res = await api.post("/tasks", taskData); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const cancelTask = createAsyncThunk("tasks/cancel", async (id, { rejectWithValue }) => {
  try { await api.delete(`/tasks/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteTask = createAsyncThunk("tasks/delete", async (id, { rejectWithValue }) => {
  try { await api.delete(`/tasks/${id}/permanent`); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteTasksByDay = createAsyncThunk("tasks/deleteByDay", async (date, { rejectWithValue }) => {
  try { const res = await api.delete("/tasks/bulk/day", { data: { date } }); return { date, ...res.data }; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchSchedulerStatus = createAsyncThunk("tasks/schedulerStatus", async (_, { rejectWithValue }) => {
  try { const res = await api.get("/tasks/scheduler/status"); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const taskSlice = createSlice({
  name: "tasks",
  initialState: { list: [], schedulerStatus: null, loading: false, error: null, total: 0 },
  reducers: { clearTaskError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.pagination?.total || 0;
      })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createTask.fulfilled, (state, action) => { state.list.unshift(action.payload.data); })
      .addCase(cancelTask.fulfilled, (state, action) => {
        const task = state.list.find(t => t._id === action.payload);
        if (task) task.status = "cancelled";
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t._id !== action.payload);
      })
      .addCase(deleteTasksByDay.fulfilled, (state, action) => {
        // Refetch handles this — but optimistically clear
        state.list = state.list; // fetchTasks called after
      })
      .addCase(fetchSchedulerStatus.fulfilled, (state, action) => { state.schedulerStatus = action.payload.data; });
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;
