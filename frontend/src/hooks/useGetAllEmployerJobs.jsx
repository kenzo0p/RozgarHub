import { setAllEmployerJobs } from "@/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useGetAllEmployerJobs() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAllEmployerJobs = async () => {
      try {
        setLoading(true);
        const res = await api.get(`${JOB_API_END_POINT}/admin`);
        if (!cancelled && res.data.success) {
          dispatch(setAllEmployerJobs(res.data.data.jobs));
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAllEmployerJobs();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return { loading };
}

export default useGetAllEmployerJobs;
