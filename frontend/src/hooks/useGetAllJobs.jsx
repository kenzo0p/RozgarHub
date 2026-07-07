import { setAllJobs } from "@/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useDebounce from "./useDebounce";

/**
 * Fetches jobs with debounced keyword search plus optional server-side
 * filters. The backend supports keyword/location/jobType/salary range and
 * sorting natively — filtering happens in MongoDB, not in the browser.
 *
 * @param {object} filters
 * @param {string} [filters.location]
 * @param {string} [filters.jobType]
 * @param {string} [filters.salaryMin]
 * @param {string} [filters.salaryMax]
 * @param {string} [filters.sortBy]    - 'createdAt' | 'salary'
 * @param {string} [filters.sortOrder] - 'asc' | 'desc'
 * @returns {{ loading: boolean }}
 */
function useGetAllJobs(filters = {}) {
  const dispatch = useDispatch();
  const { searchedQuery } = useSelector((store) => store.job);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  // Debounce the search query — wait 300ms after user stops typing
  const debouncedQuery = useDebounce(searchedQuery, 300);

  const { location, jobType, salaryMin, salaryMax, sortBy, sortOrder } = filters;

  useEffect(() => {
    let cancelled = false;
    const fetchAllJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (debouncedQuery) params.set("keyword", debouncedQuery);
        if (location) params.set("location", location);
        if (jobType) params.set("jobType", jobType);
        if (salaryMin) params.set("salaryMin", salaryMin);
        if (salaryMax) params.set("salaryMax", salaryMax);
        if (sortBy) params.set("sortBy", sortBy);
        if (sortOrder) params.set("sortOrder", sortOrder);
        params.set("limit", "24");

        const res = await api.get(`${JOB_API_END_POINT}?${params.toString()}`);
        if (!cancelled && res.data.success) {
          dispatch(setAllJobs(res.data.data));
          setTotal(res.data.pagination?.total ?? res.data.data.length);
        }
      } catch (err) {
        console.log(err);
        if (!cancelled) {
          setError(err.response?.data?.message || "Couldn't load jobs. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAllJobs();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, location, jobType, salaryMin, salaryMax, sortBy, sortOrder, dispatch]);

  return { loading, error, total };
}

export default useGetAllJobs;
