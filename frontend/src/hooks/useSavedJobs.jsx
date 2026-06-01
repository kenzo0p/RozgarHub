import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import api from "../lib/api";

/**
 * useSavedJobs — bookmark management with optimistic UI.
 *
 * Optimistic UI pattern:
 * 1. User clicks "Save" → UI updates immediately (feels instant)
 * 2. API call fires in background
 * 3. If API fails → UI rolls back and shows error toast
 *
 * This pattern is used by Twitter (like), Instagram (heart), and LinkedIn (save).
 * It makes the app feel faster than it actually is.
 */
function useSavedJobs() {
  const { user } = useSelector((store) => store.auth);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch saved job IDs on mount (optimized endpoint — IDs only, no full job data)
  const fetchSavedJobIds = useCallback(async () => {
    if (!user || user.role !== "employee") return;
    try {
      const res = await api.get("/saved-jobs/ids");
      if (res.data.success) {
        setSavedJobIds(new Set(res.data.data.jobIds));
      }
    } catch {
      // Silently fail — saved state is not critical
    }
  }, [user]);

  useEffect(() => {
    fetchSavedJobIds();
  }, [fetchSavedJobIds]);

  /**
   * Toggle save/unsave with optimistic UI.
   */
  const toggleSave = useCallback(
    async (jobId) => {
      if (!user) {
        toast.error("Please log in to save jobs");
        return;
      }

      const isSaved = savedJobIds.has(jobId);

      // Optimistic update — update UI immediately
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        if (isSaved) {
          next.delete(jobId);
        } else {
          next.add(jobId);
        }
        return next;
      });

      try {
        if (isSaved) {
          await api.delete(`/saved-jobs/unsave/${jobId}`);
          toast.success("Job removed from saved");
        } else {
          await api.post(`/saved-jobs/save/${jobId}`);
          toast.success("Job saved for later");
        }
      } catch (error) {
        // Rollback — restore previous state
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          if (isSaved) {
            next.add(jobId); // Re-add if unsave failed
          } else {
            next.delete(jobId); // Re-remove if save failed
          }
          return next;
        });

        const message =
          error.response?.data?.message || "Failed to update saved jobs";
        toast.error(message);
      }
    },
    [user, savedJobIds]
  );

  const isJobSaved = useCallback(
    (jobId) => savedJobIds.has(jobId),
    [savedJobIds]
  );

  return {
    savedJobIds,
    toggleSave,
    isJobSaved,
    loading,
    fetchSavedJobIds,
  };
}

export default useSavedJobs;
