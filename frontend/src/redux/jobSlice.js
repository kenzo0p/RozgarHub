import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
  name: "job",
  initialState: {
    allJobs: [],
    allEmployerJobs: [],
    singleJob: null,
    searchJobByText: "",
    allAppliedJobs: [],
    searchedQuery: "",
  },
  reducers: {
    setAllJobs: (state, action) => {
      state.allJobs = action.payload;
    },
    setSingleJob: (state, action) => {
      state.singleJob = action.payload;
    },
    setAllEmployerJobs: (state, action) => {
      state.allEmployerJobs = action.payload;
    },
    setSearchJobByText: (state, action) => {
      state.searchJobByText = action.payload;
    },
    setAllAppliedJobs: (state, action) => {
      state.allAppliedJobs = action.payload;
    },
    setSearchedQuery: (state, action) => {
      state.searchedQuery = action.payload;
    },
  },
});

export const {
  setAllJobs,
  setSingleJob,
  setAllEmployerJobs,
  setSearchJobByText,
  setAllAppliedJobs,
  setSearchedQuery,
} = jobSlice.actions;
export default jobSlice.reducer;
