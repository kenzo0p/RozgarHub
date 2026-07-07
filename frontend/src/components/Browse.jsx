import { Navigate } from "react-router-dom";

/**
 * /browse used to be a separate search-results page that duplicated /jobs.
 * The two are merged — this redirect keeps old links and bookmarks working.
 * The active search query travels via Redux (searchedQuery), so nothing is
 * lost in the redirect.
 */
function Browse() {
  return <Navigate to="/jobs" replace />;
}

export default Browse;
