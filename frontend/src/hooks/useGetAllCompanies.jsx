import { setCompanies } from "@/redux/companySlice";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useGetAllCompanies() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await api.get(`${COMPANY_API_END_POINT}`);
        if (!cancelled && res.data.success) {
          dispatch(setCompanies(res.data.data.companies));
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCompanies();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return { loading };
}

export default useGetAllCompanies;
