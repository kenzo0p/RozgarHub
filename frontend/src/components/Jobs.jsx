import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { motion } from "framer-motion";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { JobListSkeleton } from "./shared/Skeleton";
import EmptyState from "./shared/EmptyState";
import ErrorBoundary from "./shared/ErrorBoundary";

const LOCATIONS = ["Pune", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"];
const JOB_TYPES = ["Full-Time", "Part-Time", "Contract"];
const SALARY_RANGES = [
  { value: "0-3", label: "Up to 3 LPA" },
  { value: "3-6", label: "3 – 6 LPA" },
  { value: "6-10", label: "6 – 10 LPA" },
  { value: "10-", label: "10+ LPA" },
];
const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest first" },
  { value: "salary-desc", label: "Salary: high to low" },
  { value: "salary-asc", label: "Salary: low to high" },
];

const ALL = "all";

function Jobs() {
  const dispatch = useDispatch();
  const { allJobs, searchedQuery } = useSelector((store) => store.job);

  const [location, setLocation] = useState(ALL);
  const [jobType, setJobType] = useState(ALL);
  const [salaryRange, setSalaryRange] = useState(ALL);
  const [sort, setSort] = useState("createdAt-desc");

  const [salaryMin, salaryMax] =
    salaryRange === ALL ? ["", ""] : salaryRange.split("-");
  const [sortBy, sortOrder] = sort.split("-");

  // Server-side filtering — every change refetches from the API
  const { loading, error, total } = useGetAllJobs({
    location: location === ALL ? "" : location,
    jobType: jobType === ALL ? "" : jobType,
    salaryMin,
    salaryMax,
    sortBy,
    sortOrder,
  });

  const hasActiveFilters =
    searchedQuery || location !== ALL || jobType !== ALL || salaryRange !== ALL;

  const resetFilters = () => {
    dispatch(setSearchedQuery(""));
    setLocation(ALL);
    setJobType(ALL);
    setSalaryRange(ALL);
    setSort("createdAt-desc");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ─── Filter bar ──────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Keyword */}
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:border-primary/50">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="jobs-search" className="sr-only">
                Search jobs
              </label>
              <input
                id="jobs-search"
                type="text"
                value={searchedQuery}
                onChange={(e) => dispatch(setSearchedQuery(e.target.value))}
                placeholder="Search title, trade, or keyword…"
                className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Location */}
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-[150px]" aria-label="Filter by location">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All locations</SelectItem>
                {LOCATIONS.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Job type */}
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-[140px]" aria-label="Filter by job type">
                <SelectValue placeholder="Job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All types</SelectItem>
                {JOB_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Salary */}
            <Select value={salaryRange} onValueChange={setSalaryRange}>
              <SelectTrigger className="w-[140px]" aria-label="Filter by salary">
                <SelectValue placeholder="Salary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any salary</SelectItem>
                {SALARY_RANGES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]" aria-label="Sort results">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="gap-1.5 text-muted-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Results ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {searchedQuery ? `Results for “${searchedQuery}”` : "Find jobs"}
          </h1>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              {total.toLocaleString("en-IN")} {total === 1 ? "job" : "jobs"}
              {total > (allJobs?.length || 0) && ` · showing first ${allJobs.length}`}
            </p>
          )}
        </div>

        <ErrorBoundary>
          {loading ? (
            <div className="mt-6">
              <JobListSkeleton count={6} />
            </div>
          ) : error ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <p className="font-medium text-foreground">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : !allJobs || allJobs.length === 0 ? (
            <div className="mt-6">
              <EmptyState variant="noJobs" />
              {hasActiveFilters && (
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={resetFilters}>
                    Clear filters and show all jobs
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {allJobs.map((job) => (
                <motion.div
                  key={job?._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Job job={job} />
                </motion.div>
              ))}
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default Jobs;
