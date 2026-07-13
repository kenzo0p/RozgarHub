import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { DISPUTE_API_END_POINT } from "@/utils/constant";

/**
 * Tracks which engagements the current user has already raised a dispute on,
 * so the UI can hide the "Report issue" action on those. Mirrors the
 * given-reviews / saved-jobs-ids pattern.
 */
export default function useRaisedDisputes() {
  const [raisedIds, setRaisedIds] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    api
      .get(`${DISPUTE_API_END_POINT}/mine/raised-ids`)
      .then((res) => {
        if (active && res.data?.success) {
          setRaisedIds(new Set(res.data.data.applicationIds));
        }
      })
      .catch(() => {
        // Non-critical: worst case the button shows and the API rejects a
        // duplicate with a clear message.
      });
    return () => {
      active = false;
    };
  }, []);

  const markRaised = useCallback((applicationId) => {
    setRaisedIds((prev) => new Set(prev).add(applicationId));
  }, []);

  return { raisedIds, markRaised };
}
