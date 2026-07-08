import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import { Button } from "./ui/button";
import ContactButtons from "./shared/ContactButtons";
import { useI18n } from "@/i18n/I18nProvider";

const STATUS_KEY = { pending: "profile.statusPending", accepted: "profile.statusAccepted", rejected: "profile.statusRejected" };

const STATUS_STYLES = {
  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  accepted:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  rejected:
    "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
};

function AppliedJobTable() {
  const { allAppliedJobs } = useSelector((store) => store.job);
  const navigate = useNavigate();
  const { t } = useI18n();

  if (!allAppliedJobs || allAppliedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium text-foreground">{t("profile.noApplications")}</p>
        <p className="text-sm text-muted-foreground">
          {t("profile.noApplicationsSub")}
        </p>
        <Button onClick={() => navigate("/jobs")} size="sm" className="mt-1">
          {t("profile.browseJobs")}
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("profile.appliedOn")}</TableHead>
          <TableHead>{t("profile.role")}</TableHead>
          <TableHead>{t("profile.company")}</TableHead>
          <TableHead>{t("profile.status")}</TableHead>
          <TableHead className="text-right">{t("profile.contact")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allAppliedJobs.map((appliedJob) => (
          <TableRow
            key={appliedJob._id}
            className="cursor-pointer"
            onClick={() => navigate(`/details/${appliedJob.job?._id}`)}
          >
            <TableCell className="text-muted-foreground">
              {appliedJob?.createdAt?.split("T")[0]}
            </TableCell>
            <TableCell className="font-medium text-foreground">
              {appliedJob.job?.title}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {appliedJob.job?.company?.name}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  STATUS_STYLES[appliedJob?.status] || STATUS_STYLES.pending
                }`}
              >
                {t(STATUS_KEY[appliedJob?.status] || STATUS_KEY.pending)}
              </span>
            </TableCell>
            <TableCell
              className="text-right"
              onClick={(e) => e.stopPropagation()}
            >
              {appliedJob.status === "accepted" && appliedJob.employerContact ? (
                <ContactButtons
                  phone={appliedJob.employerContact.phone}
                  size="xs"
                  message={`Hi, I was accepted for "${appliedJob.job?.title}" on RozgarHub.`}
                />
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default AppliedJobTable;
