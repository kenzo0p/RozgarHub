import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { FileText, Check, X, Inbox } from "lucide-react";
import { useSelector } from "react-redux";
import api from "@/lib/api";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import ContactButtons from "../shared/ContactButtons";
import { useI18n } from "@/i18n/I18nProvider";

const STATUS_STYLES = {
  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  accepted:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  rejected:
    "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
};

const STATUS_LABEL = {
  pending: "employer.statusPending",
  accepted: "employer.statusAccepted",
  rejected: "employer.statusRejected",
};

function ApplicantsTable() {
  const { t } = useI18n();
  const { applicants } = useSelector((store) => store.application);
  // Local status overrides so the UI reflects an accept/reject immediately
  const [statusOverrides, setStatusOverrides] = useState({});
  const [pendingId, setPendingId] = useState(null);

  const statusHandler = async (status, id) => {
    try {
      setPendingId(id);
      // Backend validator expects lowercase: 'accepted' | 'rejected'
      const res = await api.patch(`${APPLICATION_API_END_POINT}/${id}/status`, { status });
      if (res.data.success) {
        setStatusOverrides((prev) => ({ ...prev, [id]: status }));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("employer.genericError"));
    } finally {
      setPendingId(null);
    }
  };

  const applications = applicants?.applications || [];

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium text-foreground">{t("employer.noApplicants")}</p>
        <p className="text-sm text-muted-foreground">
          {t("employer.noApplicantsSub")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("employer.applicantCol")}</TableHead>
            <TableHead>{t("employer.contact")}</TableHead>
            <TableHead>{t("employer.resume")}</TableHead>
            <TableHead>{t("employer.applied")}</TableHead>
            <TableHead>{t("employer.status")}</TableHead>
            <TableHead className="text-right">{t("employer.action")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((item) => {
            const status = statusOverrides[item._id] || item.status || "pending";
            const applicant = item?.applicant;
            const appliedOn = item?.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—";

            return (
              <TableRow key={item._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={applicant?.profile?.profilePhoto} alt="" />
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {applicant?.fullname?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                      {applicant?.fullname}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {applicant?.email && (
                    <div className="text-sm text-foreground">{applicant.email}</div>
                  )}
                  {applicant?.phoneNumber && (
                    <div className="mt-1">
                      <ContactButtons
                        phone={applicant.phoneNumber}
                        size="xs"
                        message={t("employer.applicantMsg", { name: applicant?.fullname || "" })}
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {applicant?.profile?.resume ? (
                    <a
                      href={applicant.profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("employer.resume")}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{appliedOn}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      STATUS_STYLES[status] || STATUS_STYLES.pending
                    }`}
                  >
                    {t(STATUS_LABEL[status] || STATUS_LABEL.pending)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pendingId === item._id || status === "accepted"}
                      onClick={() => statusHandler("accepted", item._id)}
                      className="gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("employer.accept")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pendingId === item._id || status === "rejected"}
                      onClick={() => statusHandler("rejected", item._id)}
                      className="gap-1 border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("employer.reject")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default ApplicantsTable;
