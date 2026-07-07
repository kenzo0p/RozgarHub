import React from "react";
import { ArrowRight, SearchX } from "lucide-react";
import LatestJobCard from "./LatestJobCard";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";

function LatestJobs() {
  const { allJobs } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const viewAllHandler = () => {
    dispatch(setSearchedQuery(""));
    navigate("/jobs");
  };

  return (
    <section aria-labelledby="latest-jobs-heading" className="bg-muted/40 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="latest-jobs-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Latest openings
            </h2>
            <p className="mt-2 text-muted-foreground">
              Fresh opportunities, posted by verified employers
            </p>
          </div>
          <button
            type="button"
            onClick={viewAllHandler}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View all jobs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {allJobs.length <= 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium text-foreground">No jobs available right now</p>
            <p className="text-sm text-muted-foreground">
              Check back soon — new openings are posted every day.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {allJobs.slice(0, 6).map((job) => (
              <LatestJobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default LatestJobs;
