import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Employee-only route guard.
 *
 * Renders <Navigate> INSTEAD of children when unauthorized — the previous
 * version rendered children while redirecting in an effect, so protected
 * pages mounted and fired their data fetches before the redirect landed.
 */
const ProtectedEmployeeRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const unauthorized = !user || user.role !== "employee";

  useEffect(() => {
    if (unauthorized) {
      toast.error("You are not authorized to access this page. Please login");
    }
  }, [unauthorized]);

  if (unauthorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedEmployeeRoute;
