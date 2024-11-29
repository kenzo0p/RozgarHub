import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

function useGetAppliedJobs() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetechAppliedJobs = async () => {
      try {
        const res = await axios.get(`${APPLICATION_API_END_POINT}/get`, {
          withCredentials:true
        });
        console.log(res.data)
        if (res.data.success) {
          dispatch(setAllAppliedJobs(res.data.application));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetechAppliedJobs();
  }, []);
}

export default useGetAppliedJobs;
