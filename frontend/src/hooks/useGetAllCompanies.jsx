import { setCompanies } from "@/redux/companySlice";
import { COMPANY_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

function useGetAllCompanies() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get(`${COMPANY_API_END_POINT}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setCompanies(res.data.data.companies));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchCompanies();
  }, []);
}

export default useGetAllCompanies;
