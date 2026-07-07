import React, { useEffect } from "react";
import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import CategoryCaraousal from "./CategoryCaraousal";
import LatestJobs from "./LatestJobs";
import Footer from "./Footer";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AboutUs from "./AboutUs";
import FAQAccordion from "./FAQAccordian";
import HowItWorks from "./HowItWorks";
import EmployerCTA from "./EmployerCTA";



function Home() {
  useGetAllJobs();
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  // The landing page is for visitors. Logged-in users go straight to
  // where their work is — employees to the job feed, employers to their
  // dashboard.
  useEffect(() => {
    if (user) {
      navigate(user.role === "employer" ? "/admin/companies" : "/jobs", {
        replace: true,
      });
    }
  }, [user, navigate]);
  return (
    <div>
      <Navbar />
      <HeroSection />
      <CategoryCaraousal />
      <LatestJobs />
      <HowItWorks />
      <AboutUs />
      <EmployerCTA />
      <FAQAccordion />
      <Footer />
    </div>
  );
}

export default Home;
