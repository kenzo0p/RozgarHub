import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Star } from "lucide-react";
import api from "@/lib/api";
import { REVIEW_API_END_POINT } from "@/utils/constant";
import { useI18n } from "@/i18n/I18nProvider";
import { StarRatingDisplay } from "./StarRating";

/**
 * Reviews received by a user — a summary header plus the list. Used on the
 * profile so a worker (or employer) can show the reputation they've earned.
 */
function ReviewsList({ userId }) {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setLoading(true);
    api
      .get(`${REVIEW_API_END_POINT}/user/${userId}`)
      .then((res) => {
        if (active && res.data?.success) setData(res.data.data);
      })
      .catch(() => {
        if (active) setData(null);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-muted/40" />
        ))}
      </div>
    );
  }

  const summary = data?.summary;
  const reviews = data?.reviews || [];

  if (!summary || summary.count === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
        <Star className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{t("reviews.noneYet")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <span className="text-3xl font-bold text-foreground">
          {Number(summary.average).toFixed(1)}
        </span>
        <div>
          <StarRatingDisplay value={summary.average} size="lg" showValue={false} />
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("reviews.basedOn", { count: summary.count })}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-4">
        {reviews.map((review) => (
          <li key={review._id} className="flex gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={review.rater?.profile?.profilePhoto} alt="" />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {review.rater?.fullname?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {review.rater?.fullname}
                </span>
                <StarRatingDisplay value={review.rating} showValue={false} />
              </div>
              {review.comment && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {review.job?.title ? `${review.job.title} · ` : ""}
                {review.createdAt?.split("T")[0]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReviewsList;
