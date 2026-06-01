import React from "react";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import useSavedJobs from "../hooks/useSavedJobs";

function Job({ job }) {
  const navigate = useNavigate();
  const { isJobSaved, toggleSave } = useSavedJobs();
  const saved = isJobSaved(job?._id);

  const daysAgoFunction = (mongodbtime) => {
    const createdAt = new Date(mongodbtime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
  };

  const daysAgo = daysAgoFunction(job?.createdAt);

  return (
    <div className="p-5 rounded-lg shadow-md bg-card border border-border hover:shadow-lg transition-shadow duration-200 group">
      {/* Header: Date + Bookmark */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {daysAgo === 0 ? "Today" : `${daysAgo} days ago`}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full h-8 w-8 transition-colors ${
            saved
              ? "text-blue-600 dark:text-blue-400"
              : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
          }`}
          onClick={() => toggleSave(job?._id)}
          aria-label={saved ? "Remove from saved" : "Save for later"}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 fill-current" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Company Info */}
      <div className="flex items-center gap-2 my-2">
        <Button className="p-6" variant="outline" size="icon">
          <Avatar>
            <AvatarImage src={job?.company?.logo} />
            <AvatarFallback className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              {job?.company?.name?.charAt(0) || "C"}
            </AvatarFallback>
          </Avatar>
        </Button>
        <div>
          <h2 className="font-medium text-lg text-foreground">
            {job?.company?.name || job?.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {job?.location || "India"}
          </p>
        </div>
      </div>

      {/* Job Title + Description */}
      <div>
        <h1 className="font-bold text-lg my-2 text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {job?.title}
        </h1>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job?.description}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <Badge variant="secondary" className="text-blue-600 dark:text-blue-400 font-semibold">
          {job?.position} Positions
        </Badge>
        <Badge variant="secondary" className="text-orange-600 dark:text-orange-400 font-semibold">
          {job?.jobType}
        </Badge>
        <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400 font-semibold">
          {job?.salary} LPA
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4">
        <Button
          onClick={() => navigate(`/details/${job?._id}`)}
          variant="outline"
          size="sm"
        >
          Details
        </Button>
        <Button
          onClick={() => toggleSave(job?._id)}
          variant={saved ? "secondary" : "default"}
          size="sm"
          className={!saved ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
        >
          {saved ? "Saved ✓" : "Save for later"}
        </Button>
      </div>
    </div>
  );
}

export default Job;
