import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

function useGetAppliedJobs() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetechAppliedJobs = async () => {
      try {
        const res = await api.get(`${APPLICATION_API_END_POINT}`, {
          withCredentials:true
        });
        if (res.data.success) {
          dispatch(setAllAppliedJobs(res.data.data.applications));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetechAppliedJobs();
  }, []);
}

export default useGetAppliedJobs;
