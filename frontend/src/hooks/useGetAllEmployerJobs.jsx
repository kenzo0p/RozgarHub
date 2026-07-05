import { setAllEmployerJobs } from "@/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

function useGetAllEmployerJobs() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllEmployerJobs = async () => {
      try {
        const res = await api.get(`${JOB_API_END_POINT}/admin`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setAllEmployerJobs(res.data.data.jobs));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllEmployerJobs();
  }, [dispatch]);
}

export default useGetAllEmployerJobs;
