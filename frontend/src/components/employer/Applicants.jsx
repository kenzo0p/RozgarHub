import React, { useEffect } from "react";
import Navbar from "../shared/Navbar";
import ApplicantsTable from "./ApplicantsTable";
import api from "@/lib/api";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplicants } from "@/redux/applicationSlice";

function Applicants() {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);

  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await api.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`);
        dispatch(setAllApplicants(res.data.data.job));
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllApplicants();
  }, [dispatch, params.id]);

  const count = applicants?.applications?.length ?? 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <button
          type="button"
          onClick={() => navigate("/admin/jobs")}
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </button>

        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Applicants
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {applicants?.title ? `for “${applicants.title}” · ` : ""}
            {count} {count === 1 ? "person has" : "people have"} applied
          </p>
        </div>

        <div className="mt-6">
          <ApplicantsTable />
        </div>
      </div>
    </div>
  );
}

export default Applicants;
