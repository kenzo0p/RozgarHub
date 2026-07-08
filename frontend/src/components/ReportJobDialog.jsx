import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { JOB_API_END_POINT } from "@/utils/constant";

const REASONS = [
  { value: "fake", label: "Fake or scam job" },
  { value: "asks_for_money", label: "Asks for money / a fee" },
  { value: "misleading_pay", label: "Misleading pay or details" },
  { value: "offensive", label: "Offensive or inappropriate" },
  { value: "other", label: "Something else" },
];

function ReportJobDialog({ open, setOpen, jobId }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please choose a reason.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(`${JOB_API_END_POINT}/${jobId}/report`, { reason, note });
      if (res.data.success) {
        toast.success(res.data.message);
        setOpen(false);
        setReason("");
        setNote("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't submit the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this job</DialogTitle>
          <DialogDescription>
            Help keep RozgarHub safe. Reports are reviewed and repeatedly
            reported jobs are removed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Why are you reporting it?</Label>
            <div className="space-y-1.5">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-sm transition-colors ${
                    reason === r.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="accent-[hsl(var(--primary))]"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-note">Anything to add? (optional)</Label>
            <textarea
              id="report-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="More details…"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Reporting…
                </>
              ) : (
                "Submit report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReportJobDialog;
