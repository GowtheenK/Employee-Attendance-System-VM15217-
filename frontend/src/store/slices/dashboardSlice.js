import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employeeData: null,
  managerData: null,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setEmployeeData: (state, action) => {
      state.employeeData = action.payload;
    },
    setManagerData: (state, action) => {
      state.managerData = action.payload;
    },
  },
});

export const { setEmployeeData, setManagerData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
