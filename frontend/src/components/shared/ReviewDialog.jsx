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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { REVIEW_API_END_POINT } from "@/utils/constant";
import { useI18n } from "@/i18n/I18nProvider";
import { StarRatingInput } from "./StarRating";

/**
 * Leave a rating for the other party of an accepted engagement.
 *
 * @param {string} applicationId - the engagement being reviewed
 * @param {string} rateeName - who is being reviewed (shown in the title)
 * @param {(applicationId: string) => void} onSubmitted - called after success
 */
function ReviewDialog({ open, setOpen, applicationId, rateeName, onSubmitted }) {
  const { t } = useI18n();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error(t("reviews.pickStars"));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(REVIEW_API_END_POINT, {
        applicationId,
        rating,
        comment: comment.trim() || undefined,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        onSubmitted?.(applicationId);
        setOpen(false);
        setRating(0);
        setComment("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("reviews.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {rateeName ? t("reviews.rateName", { name: rateeName }) : t("reviews.title")}
            </DialogTitle>
            <DialogDescription>{t("reviews.subtitle")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>{t("reviews.yourRating")}</Label>
              <StarRatingInput value={rating} onChange={setRating} label={t("reviews.yourRating")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="review-comment">{t("reviews.commentLabel")}</Label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={t("reviews.commentPlaceholder")}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t("reviews.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {t("reviews.submitting")}
                </>
              ) : (
                t("reviews.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewDialog;
