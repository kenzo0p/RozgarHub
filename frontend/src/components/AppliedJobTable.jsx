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

  if (!allAppliedJobs || allAppliedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium text-foreground">No applications yet</p>
        <p className="text-sm text-muted-foreground">
          Jobs you apply to will show up here with their status.
        </p>
        <Button onClick={() => navigate("/jobs")} size="sm" className="mt-1">
          Browse jobs
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Applied on</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Contact</TableHead>
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
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  STATUS_STYLES[appliedJob?.status] || STATUS_STYLES.pending
                }`}
              >
                {appliedJob.status}
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
