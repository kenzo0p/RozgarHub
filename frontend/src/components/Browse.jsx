import React, { useEffect } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { JobListSkeleton } from "./shared/Skeleton";
import EmptyState from "./shared/EmptyState";
import ErrorBoundary from "./shared/ErrorBoundary";

function Browse() {
  useGetAllJobs();
  const { allJobs } = useSelector((store) => store.job);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(""));
    };
  }, []);

  const hasJobs = allJobs && allJobs.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto my-10 px-4">
        <h1 className="font-bold text-xl my-10 text-foreground">
          Search Results ({allJobs?.length || 0})
        </h1>
        <ErrorBoundary>
          {!allJobs ? (
            <JobListSkeleton count={6} />
          ) : !hasJobs ? (
            <EmptyState variant="noJobs" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allJobs.map((job) => (
                <Job key={job._id} job={job} />
              ))}
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default Browse;