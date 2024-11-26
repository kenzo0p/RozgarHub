import {createSlice} from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name:"job",
    initialState:{
        allJobs:[],
        allEmployerJobs:[],
        singleJob:null,
        searchJobByText:""

    },
    reducers:{
        setAllJobs:(state,action)=>{
            state.allJobs = action.payload
        },
        setSingleJob:(state,action)=>{
            state.singleJob =action.payload
        },
        setAllEmployerJobs : (state,action) =>{
            state.allEmployerJobs  =action.payload
        },
        setSearchJobByText:(state,action) =>{
            state.searchJobByText = action.payload
        }
    }
})

export const {setAllJobs,setSingleJob ,setAllEmployerJobs, setSearchJobByText} = jobSlice.actions;
export default jobSlice.reducer;