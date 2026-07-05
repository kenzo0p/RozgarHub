import { setSingleCompany } from "@/redux/companySlice";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

function useGetCompanyById(companyId) {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchSingleCompany = async () => {
      try {
        const res = await api.get(`${COMPANY_API_END_POINT}/${companyId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSingleCompany(res.data.data.company));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleCompany();
  }, [companyId,dispatch]);
}

export default useGetCompanyById;
