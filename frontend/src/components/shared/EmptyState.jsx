import { SearchX, FileX, Inbox, Bookmark, Briefcase } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

/**
 * EmptyState — reusable component for "nothing to show" states.
 *
 * Better UX than showing nothing or a raw "No results" text.
 * Each variant has a context-appropriate icon, message, and CTA.
 */

const EMPTY_VARIANTS = {
  noJobs: {
    icon: SearchX,
    title: "No jobs found",
    description: "Try adjusting your search or filters to find what you're looking for.",
    actionLabel: "Clear Filters",
    actionPath: "/jobs",
  },
  noApplications: {
    icon: FileX,
    title: "No applications yet",
    description: "Start applying to jobs that match your skills. Your applications will appear here.",
    actionLabel: "Browse Jobs",
    actionPath: "/jobs",
  },
  noSavedJobs: {
    icon: Bookmark,
    title: "No saved jobs",
    description: "Bookmark jobs you're interested in to view them later.",
    actionLabel: "Explore Jobs",
    actionPath: "/jobs",
  },
  noNotifications: {
    icon: Inbox,
    title: "All caught up!",
    description: "You have no notifications right now. We'll notify you when something important happens.",
  },
  noApplicants: {
    icon: FileX,
    title: "No applicants yet",
    description: "Share your job posting to start receiving applications.",
  },
  noCompanies: {
    icon: Briefcase,
    title: "No companies registered",
    description: "Create your company profile to start posting jobs.",
    actionLabel: "Create Company",
    actionPath: "/admin/companies/create",
  },
};

function EmptyState({ variant = "noJobs", className = "", onAction }) {
  const navigate = useNavigate();
  const config = EMPTY_VARIANTS[variant] || EMPTY_VARIANTS.noJobs;
  const Icon = config.icon;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (config.actionPath) {
      navigate(config.actionPath);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {config.title}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        {config.description}
      </p>
      {config.actionLabel && (
        <Button onClick={handleAction} variant="outline" size="sm">
          {config.actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
