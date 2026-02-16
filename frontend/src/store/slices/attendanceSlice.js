import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  today: null,
  history: [],
  summary: null,
  allAttendance: [],
  exportLoading: false,
};

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setToday: (state, action) => {
      state.today = action.payload;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    setSummary: (state, action) => {
      state.summary = action.payload;
    },
    setAllAttendance: (state, action) => {
      state.allAttendance = action.payload;
    },
    setExportLoading: (state, action) => {
      state.exportLoading = action.payload;
    },
  },
});

export const { setToday, setHistory, setSummary, setAllAttendance, setExportLoading } = attendanceSlice.actions;
export default attendanceSlice.reducer;
