import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const [toastDisplayed, setToastDisplayed] = useState(false);

  useEffect(() => {
    if (user === null || user.role !== "employee") {
      if (!toastDisplayed) {
        setToastDisplayed(true);
        navigate("/");
        toast.error("You are not authorized to access this page. Please login");
      }
    }
  }, [user, navigate, toastDisplayed]);

  return <>{children}</>;
};

export default ProtectedRoute;
