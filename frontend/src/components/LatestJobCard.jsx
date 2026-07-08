import React from "react";
import { MapPin, Briefcase, Users, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatWage } from "@/utils/wage";
import VerifiedBadge from "./shared/VerifiedBadge";

function LatestJobCard({ job }) {
  const navigate = useNavigate();
  const companyInitial = job?.company?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <button
      type="button"
      onClick={() => navigate(`/details/${job._id}`)}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Company row */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
          {companyInitial}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-semibold text-foreground">{job?.company?.name}</p>
            {job?.company?.verificationStatus === "verified" && (
              <VerifiedBadge status="verified" />
            )}
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {job?.location || "India"}
          </p>
        </div>
        <ArrowUpRight
          className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      {/* Title + description */}
      <h3 className="mt-4 line-clamp-1 text-lg font-bold text-foreground group-hover:text-primary">
        {job?.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {job?.description}
      </p>

      {/* Meta chips */}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs font-medium">
        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-semibold text-primary">
          {formatWage(job?.salary, job?.wageType)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
          <Briefcase className="h-3 w-3" aria-hidden="true" />
          {job?.jobType}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
          <Users className="h-3 w-3" aria-hidden="true" />
          {job?.position} {job?.position === 1 ? "opening" : "openings"}
        </span>
      </div>
    </button>
  );
}

export default LatestJobCard;
