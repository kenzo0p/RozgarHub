import { useEffect, useRef, useCallback } from "react";

/**
 * useInfiniteScroll — triggers a callback when the user scrolls near the bottom.
 *
 * Uses IntersectionObserver (not scroll events) for performance:
 * - Scroll events fire 60+ times/second and cause layout thrashing
 * - IntersectionObserver is async and only fires when visibility changes
 *
 * Usage:
 *   const { observerRef } = useInfiniteScroll(fetchNextPage, { hasMore, isLoading });
 *   return <div ref={observerRef} /> // Place at the bottom of your list
 *
 * @param callback - Function to call when sentinel element is visible
 * @param options - { hasMore, isLoading, threshold, rootMargin }
 */
function useInfiniteScroll(callback, options = {}) {
  const { hasMore = true, isLoading = false, threshold = 0.1, rootMargin = "200px" } = options;
  const observerRef = useRef(null);
  const observerInstance = useRef(null);

  const handleIntersection = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        callback();
      }
    },
    [callback, hasMore, isLoading]
  );

  useEffect(() => {
    // Cleanup previous observer
    if (observerInstance.current) {
      observerInstance.current.disconnect();
    }

    if (!observerRef.current || !hasMore) return;

    observerInstance.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observerInstance.current.observe(observerRef.current);

    return () => {
      if (observerInstance.current) {
        observerInstance.current.disconnect();
      }
    };
  }, [handleIntersection, hasMore, threshold, rootMargin]);

  return { observerRef };
}

export default useInfiniteScroll;
