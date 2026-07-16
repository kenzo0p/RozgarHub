import React from "react";
import { Button } from "./ui/button";
import {
  Bookmark,
  BookmarkCheck,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { formatWage } from "@/utils/wage";
import useSavedJobs from "../hooks/useSavedJobs";
import VerifiedBadge from "./shared/VerifiedBadge";
import { useI18n } from "@/i18n/I18nProvider";

function Job({ job }) {
  const navigate = useNavigate();
  const { isJobSaved, toggleSave } = useSavedJobs();
  const { t } = useI18n();
  const saved = isJobSaved(job?._id);

  const daysAgoFunction = (mongodbtime) => {
    const createdAt = new Date(mongodbtime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
  };

  const daysAgo = daysAgoFunction(job?.createdAt);

  // Business jobs show the company; individual jobs (e.g. someone hiring a
  // driver for their own car) show the poster's own name.
  const isCompany = !!job?.company;
  const posterName = isCompany ? job?.company?.name : job?.created_By?.fullname;
  const posterVerified = isCompany
    ? job?.company?.verificationStatus === "verified"
    : job?.created_By?.verificationStatus === "verified";

  return (
    <div className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* Header: date + bookmark */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {daysAgo === 0 ? t("card.postedToday") : t("card.daysAgo", { n: daysAgo })}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full transition-colors ${
            saved ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
          onClick={() => toggleSave(job?._id)}
          aria-label={saved ? "Remove from saved" : "Save for later"}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 fill-current" aria-hidden="true" />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Poster: company for businesses, the person for individual jobs */}
      <div className="mt-2 flex items-center gap-3">
        <Avatar className="h-11 w-11 rounded-lg border border-border">
          <AvatarImage src={isCompany ? job?.company?.logo : undefined} alt="" />
          <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-primary">
            {posterName?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate font-semibold text-foreground">
              {posterName}
            </h2>
            {posterVerified && <VerifiedBadge status="verified" />}
            {!isCompany && (
              <span className="shrink-0 text-xs text-muted-foreground">
                · {t("card.individual")}
              </span>
            )}
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {job?.location || "India"}
          </p>
        </div>
      </div>

      {/* Title + description */}
      <h1 className="mt-3 line-clamp-1 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
        {job?.title}
      </h1>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {job?.description}
      </p>

      {/* Meta chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-semibold text-primary">
          {formatWage(job?.salary, job?.wageType)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
          <Briefcase className="h-3 w-3" aria-hidden="true" />
          {job?.jobType}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
          <Users className="h-3 w-3" aria-hidden="true" />
          {job?.position} {job?.position === 1 ? t("card.opening") : t("card.openings")}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 pt-4">
        <Button onClick={() => navigate(`/details/${job?._id}`)} className="flex-1" size="sm">
          {t("card.viewDetails")}
        </Button>
        <Button
          onClick={() => toggleSave(job?._id)}
          variant="outline"
          size="sm"
          className={saved ? "border-primary/40 text-primary" : ""}
        >
          {saved ? t("card.saved") : t("card.save")}
        </Button>
      </div>
    </div>
  );
}

export default Job;
