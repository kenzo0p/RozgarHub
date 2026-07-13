import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { DISPUTE_API_END_POINT } from "@/utils/constant";
import { useI18n } from "@/i18n/I18nProvider";

// Reason options differ by who's raising the dispute.
const REASONS = {
  employee: [
    { value: "not_paid", key: "reasonNotPaid" },
    { value: "underpaid", key: "reasonUnderpaid" },
    { value: "unsafe", key: "reasonUnsafe" },
    { value: "other", key: "reasonOther" },
  ],
  employer: [
    { value: "no_show", key: "reasonNoShow" },
    { value: "incomplete_work", key: "reasonIncomplete" },
    { value: "other", key: "reasonOther" },
  ],
};

/**
 * Raise a post-hire dispute on an engagement — "didn't get paid", "no-show",
 * etc. Reason options are tailored to whether a worker or an employer is
 * reporting.
 */
function DisputeDialog({ open, setOpen, applicationId, role = "employee", onSubmitted }) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const reasons = REASONS[role] || REASONS.employee;

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error(t("dispute.pickReason"));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(DISPUTE_API_END_POINT, {
        applicationId,
        reason,
        description: description.trim() || undefined,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        onSubmitted?.(applicationId);
        setOpen(false);
        setReason("");
        setDescription("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("dispute.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{t("dispute.title")}</DialogTitle>
            <DialogDescription>{t("dispute.subtitle")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>{t("dispute.reason")}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger aria-label={t("dispute.reason")}>
                  <SelectValue placeholder={t("dispute.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map(({ value, key }) => (
                    <SelectItem key={value} value={value}>
                      {t(`dispute.${key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dispute-desc">{t("dispute.descLabel")}</Label>
              <textarea
                id="dispute-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={t("dispute.descPlaceholder")}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t("dispute.cancel")}
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {t("dispute.submitting")}
                </>
              ) : (
                t("dispute.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DisputeDialog;
