import { setAllJobs } from "@/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useDebounce from "./useDebounce";

/**
 * Fetches all jobs with debounced keyword search.
 *
 * The searchedQuery from Redux is debounced by 300ms — this means
 * rapid keystrokes don't fire separate API calls. Only the final
 * query (after user stops typing) triggers a fetch.
 *
 * Also includes searchedQuery in the dependency array so the effect
 * re-runs when the query changes (the original had an empty array).
 */
function useGetAllJobs() {
  const dispatch = useDispatch();
  const { searchedQuery } = useSelector((store) => store.job);

  // Debounce the search query — wait 300ms after user stops typing
  const debouncedQuery = useDebounce(searchedQuery, 300);

  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        const res = await api.get(
          `${JOB_API_END_POINT}?keyword=${debouncedQuery}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setAllJobs(res.data.data));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllJobs();
  }, [debouncedQuery, dispatch]);
}

export default useGetAllJobs;
