import React, { useState } from "react";
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
import { Inbox, Star, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { Button } from "./ui/button";
import ContactButtons from "./shared/ContactButtons";
import ReviewDialog from "./shared/ReviewDialog";
import DisputeDialog from "./shared/DisputeDialog";
import useGivenReviews from "@/hooks/useGivenReviews";
import useRaisedDisputes from "@/hooks/useRaisedDisputes";
import { useI18n } from "@/i18n/I18nProvider";

// Statuses where a real engagement exists — worker can contact & rate.
const ENGAGED = ["accepted", "started", "completed", "paid"];

const STATUS_KEY = {
  pending: "profile.statusPending",
  accepted: "profile.statusAccepted",
  rejected: "profile.statusRejected",
  started: "profile.statusStarted",
  completed: "profile.statusCompleted",
  paid: "profile.statusPaid",
};

const STATUS_STYLES = {
  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  accepted:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  rejected:
    "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  started:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  completed:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
  paid:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
};

function AppliedJobTable() {
  const { allAppliedJobs } = useSelector((store) => store.job);
  const navigate = useNavigate();
  const { t } = useI18n();
  const { reviewedIds, markReviewed } = useGivenReviews();
  const { raisedIds, markRaised } = useRaisedDisputes();
  const [reviewFor, setReviewFor] = useState(null);
  const [disputeFor, setDisputeFor] = useState(null);
  // Track locally-confirmed payments so the row updates without a refetch.
  const [confirmedIds, setConfirmedIds] = useState(() => new Set());
  const [confirmingId, setConfirmingId] = useState(null);

  const confirmPayment = async (id) => {
    try {
      setConfirmingId(id);
      const res = await api.patch(`${APPLICATION_API_END_POINT}/${id}/confirm-payment`);
      if (res.data.success) {
        setConfirmedIds((prev) => new Set(prev).add(id));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("pay.confirmError"));
    } finally {
      setConfirmingId(null);
    }
  };

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
    <>
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
              {ENGAGED.includes(appliedJob.status) ? (
                <div className="flex flex-col items-end gap-1.5">
                  {appliedJob.employerContact && (
                    <ContactButtons
                      phone={appliedJob.employerContact.phone}
                      size="xs"
                      message={`Hi, I was accepted for "${appliedJob.job?.title}" on RozgarHub.`}
                    />
                  )}
                  {appliedJob.status === "paid" &&
                    (appliedJob.paymentConfirmed || confirmedIds.has(appliedJob._id) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        {t("pay.confirmedChip")}
                      </span>
                    ) : (
                      <Button
                        size="xs"
                        className="gap-1"
                        disabled={confirmingId === appliedJob._id}
                        onClick={() => confirmPayment(appliedJob._id)}
                      >
                        {confirmingId === appliedJob._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        )}
                        {t("pay.confirmReceived")}
                      </Button>
                    ))}
                  {reviewedIds.has(appliedJob._id) ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                      {t("reviews.rated")}
                    </span>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      className="gap-1"
                      onClick={() =>
                        setReviewFor({
                          id: appliedJob._id,
                          name: appliedJob.employerContact?.name || appliedJob.job?.company?.name,
                        })
                      }
                    >
                      <Star className="h-3 w-3" aria-hidden="true" />
                      {t("reviews.rateEmployer")}
                    </Button>
                  )}
                  {raisedIds.has(appliedJob._id) ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      {t("dispute.reported")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDisputeFor(appliedJob._id)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-red-600 dark:hover:text-red-400"
                    >
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      {t("dispute.report")}
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <ReviewDialog
      open={!!reviewFor}
      setOpen={(v) => !v && setReviewFor(null)}
      applicationId={reviewFor?.id}
      rateeName={reviewFor?.name}
      onSubmitted={markReviewed}
    />
    <DisputeDialog
      open={!!disputeFor}
      setOpen={(v) => !v && setDisputeFor(null)}
      applicationId={disputeFor}
      role="employee"
      onSubmitted={markRaised}
    />
    </>
  );
}

export default AppliedJobTable;
