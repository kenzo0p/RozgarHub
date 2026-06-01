import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import FilterCard from "./FilterCard";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { JobListSkeleton } from "./shared/Skeleton";
import EmptyState from "./shared/EmptyState";
import ErrorBoundary from "./shared/ErrorBoundary";

function Jobs() {
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allJobs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state until jobs arrive from Redux
    if (allJobs !== undefined && allJobs !== null) {
      setIsLoading(false);
    }

    if (searchedQuery) {
      const filteredJobs = allJobs.filter((job) => {
        return (
          job.title?.toLowerCase().includes(searchedQuery.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchedQuery.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchedQuery.toLowerCase())
        );
      });
      setFilterJobs(filteredJobs);
    } else {
      setFilterJobs(allJobs);
    }
  }, [allJobs, searchedQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-5 px-4">
        <div className="flex gap-5">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <ErrorBoundary>
              <FilterCard />
            </ErrorBoundary>
          </div>

          {/* Job Grid */}
          <div className="flex-1 h-[88vh] overflow-y-auto pb-5">
            <ErrorBoundary>
              {isLoading ? (
                <JobListSkeleton count={6} />
              ) : filterJobs.length <= 0 ? (
                <EmptyState variant="noJobs" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filterJobs.map((job) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      key={job?._id}
                    >
                      <Job job={job} />
                    </motion.div>
                  ))}
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Jobs;
