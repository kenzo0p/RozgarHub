import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import EmployerJobsTable from "./EmployerJobsTable";
import useGetAllEmployerJobs from "@/hooks/useGetAllEmployerJobs";
import { setSearchJobByText } from "@/redux/jobSlice";

function EmployerJobs() {
  useGetAllEmployerJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto my-10">
        <div className=" flex items-center justify-between my-5">
          <Input
            className="w-fit"
            placeholder="Filter by role ,company name"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            className="bg-blue-500"
            onClick={() => navigate("/admin/jobs/create")}
          >
            Post New Jobs
          </Button>
        </div>
        <EmployerJobsTable/>
      </div>
    </div>
  );
}

export default EmployerJobs;
