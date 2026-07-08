import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { motion } from "framer-motion";
import { Search, RotateCcw, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
const WAGE_TYPES = [
  { value: "daily", label: "Daily wage" },
  { value: "monthly", label: "Monthly" },
  { value: "hourly", label: "Hourly" },
  { value: "weekly", label: "Weekly" },
  { value: "fixed", label: "Fixed / per job" },
];
const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest first" },
  { value: "salary-desc", label: "Pay: high to low" },
  { value: "salary-asc", label: "Pay: low to high" },
];

const ALL = "all";

function Jobs() {
  const dispatch = useDispatch();
  const { allJobs, searchedQuery } = useSelector((store) => store.job);

  const [location, setLocation] = useState(ALL);
  const [jobType, setJobType] = useState(ALL);
  const [wageType, setWageType] = useState(ALL);
  const [sort, setSort] = useState("createdAt-desc");
  const [coords, setCoords] = useState(null); // { lat, lng } when "near me" is on
  const [locating, setLocating] = useState(false);

  const [sortBy, sortOrder] = sort.split("-");

  // Server-side filtering — every change refetches from the API
  const { loading, error, total } = useGetAllJobs({
    location: location === ALL ? "" : location,
    jobType: jobType === ALL ? "" : jobType,
    wageType: wageType === ALL ? "" : wageType,
    lat: coords?.lat,
    lng: coords?.lng,
    radius: coords ? 25 : undefined,
    sortBy,
    sortOrder,
  });

  const hasActiveFilters =
    searchedQuery || location !== ALL || jobType !== ALL || wageType !== ALL || coords;

  const resetFilters = () => {
    dispatch(setSearchedQuery(""));
    setLocation(ALL);
    setJobType(ALL);
    setWageType(ALL);
    setSort("createdAt-desc");
    setCoords(null);
  };

  const toggleNearMe = () => {
    if (coords) {
      setCoords(null);
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Location isn't available on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        // A specific city filter would contradict "near me"
        setLocation(ALL);
        setLocating(false);
      },
      () => {
        toast.error("Couldn't get your location. Please allow location access.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
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

            {/* Near me */}
            <Button
              type="button"
              variant={coords ? "default" : "outline"}
              onClick={toggleNearMe}
              disabled={locating}
              className="gap-1.5"
            >
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <MapPin className="h-4 w-4" aria-hidden="true" />
              )}
              {coords ? "Near me: on" : "Near me"}
            </Button>

            {/* Location */}
            <Select value={location} onValueChange={setLocation} disabled={!!coords}>
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

            {/* Wage type */}
            <Select value={wageType} onValueChange={setWageType}>
              <SelectTrigger className="w-[150px]" aria-label="Filter by pay period">
                <SelectValue placeholder="Pay period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any pay period</SelectItem>
                {WAGE_TYPES.map(({ value, label }) => (
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
