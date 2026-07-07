import React, { useMemo } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Briefcase, Users, MapPin, IndianRupee, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function JobRow({ job }) {
  const navigate = useNavigate();
  const applicants = job?.applications?.length ?? 0;
  const created = job?.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="h-11 w-11 rounded-lg border border-border">
          <AvatarImage src={job?.company?.logo} alt="" />
          <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-primary">
            {job?.company?.name?.charAt(0)?.toUpperCase() || "C"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">{job?.title}</h3>
          <p className="truncate text-sm text-muted-foreground">
            {job?.company?.name} · Posted {created}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {job?.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <IndianRupee className="h-3 w-3" aria-hidden="true" />
              {job?.salary} LPA
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3 w-3" aria-hidden="true" />
              {job?.jobType}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
          <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          {applicants} {applicants === 1 ? "applicant" : "applicants"}
        </span>
        <Button onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} size="sm">
          View applicants
        </Button>
      </div>
    </div>
  );
}

function EmployerJobsTable({ loading }) {
  const { allEmployerJobs, searchJobByText } = useSelector((store) => store.job);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!allEmployerJobs) return [];
    if (!searchJobByText) return allEmployerJobs;
    const q = searchJobByText.toLowerCase();
    return allEmployerJobs.filter(
      (job) =>
        job?.title?.toLowerCase().includes(q) ||
        job?.company?.name?.toLowerCase().includes(q)
    );
  }, [allEmployerJobs, searchJobByText]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    );
  }

  if (!allEmployerJobs || allEmployerJobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <Briefcase className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium text-foreground">You haven&apos;t posted any jobs yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Post your first job to start receiving applications from skilled workers.
        </p>
        <Button onClick={() => navigate("/admin/jobs/create")} className="mt-1 gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Post a job
        </Button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No jobs match &ldquo;{searchJobByText}&rdquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map((job) => (
        <JobRow key={job._id} job={job} />
      ))}
    </div>
  );
}

export default EmployerJobsTable;
