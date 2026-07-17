import { SearchX, FileX, Inbox, Bookmark, Briefcase } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * EmptyState — reusable component for "nothing to show" states.
 *
 * Better UX than showing nothing or a raw "No results" text.
 * Each variant has a context-appropriate icon, message, and CTA.
 */

const EMPTY_VARIANTS = {
  noJobs: {
    icon: SearchX,
    titleKey: "empty.noJobsTitle",
    descKey: "empty.noJobsDesc",
    actionKey: "empty.noJobsAction",
    actionPath: "/jobs",
  },
  noApplications: {
    icon: FileX,
    titleKey: "empty.noAppsTitle",
    descKey: "empty.noAppsDesc",
    actionKey: "empty.noAppsAction",
    actionPath: "/jobs",
  },
  noSavedJobs: {
    icon: Bookmark,
    titleKey: "empty.noSavedTitle",
    descKey: "empty.noSavedDesc",
    actionKey: "empty.noSavedAction",
    actionPath: "/jobs",
  },
  noNotifications: {
    icon: Inbox,
    titleKey: "empty.noNotifsTitle",
    descKey: "empty.noNotifsDesc",
  },
  noApplicants: {
    icon: FileX,
    titleKey: "empty.noApplicantsTitle",
    descKey: "empty.noApplicantsDesc",
  },
  noCompanies: {
    icon: Briefcase,
    titleKey: "empty.noCompaniesTitle",
    descKey: "empty.noCompaniesDesc",
    actionKey: "empty.noCompaniesAction",
    actionPath: "/admin/companies/create",
  },
};

function EmptyState({ variant = "noJobs", className = "", onAction }) {
  const navigate = useNavigate();
  const { t } = useI18n();
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
        {t(config.titleKey)}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        {t(config.descKey)}
      </p>
      {config.actionKey && (
        <Button onClick={handleAction} variant="outline" size="sm">
          {t(config.actionKey)}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
