import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { REVIEW_API_END_POINT } from "@/utils/constant";

/**
 * Tracks which engagements (applications) the current user has already
 * reviewed, so the UI can hide the "Rate" action on those. Mirrors the
 * saved-jobs-ids pattern — one cheap fetch, then a local set.
 */
export default function useGivenReviews() {
  const [reviewedIds, setReviewedIds] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    api
      .get(`${REVIEW_API_END_POINT}/mine/given`)
      .then((res) => {
        if (active && res.data?.success) {
          setReviewedIds(new Set(res.data.data.applicationIds));
        }
      })
      .catch(() => {
        // Non-critical: worst case the Rate button shows and the API rejects
        // a duplicate with a clear message.
      });
    return () => {
      active = false;
    };
  }, []);

  const markReviewed = useCallback((applicationId) => {
    setReviewedIds((prev) => new Set(prev).add(applicationId));
  }, []);

  return { reviewedIds, markReviewed };
}
