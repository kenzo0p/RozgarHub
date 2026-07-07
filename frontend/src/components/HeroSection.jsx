import React, { useEffect, useState } from "react";
import { Search, MapPin, Briefcase, Building2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

const POPULAR_SEARCHES = ["Electrician", "Driver", "Plumber", "Security Guard"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" },
  }),
};

function StatItem({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="text-left">
        <p className="text-lg font-bold leading-none text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function HeroSection() {
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api
      .get("/analytics/platform")
      .then((res) => {
        if (!cancelled && res.data.success) setStats(res.data.data);
      })
      .catch(() => {
        // Stats strip simply doesn't render if analytics is unavailable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const searchJobHandler = (searchQuery) => {
    dispatch(setSearchedQuery(searchQuery));
    navigate("/jobs");
  };

  const formatCount = (n) =>
    n >= 1000 ? `${Math.floor(n / 1000).toLocaleString("en-IN")}k+` : `${n}`;

  return (
    <section className="relative overflow-hidden">
      {/* Decorative background: soft brand glow + grid, both theme-aware */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:56px_56px] opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:pt-24">
        <motion.span
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          India&apos;s job platform for skilled workers
        </motion.span>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          Find work that values
          <span className="block bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            your skills
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg"
        >
          Thousands of verified openings for electricians, drivers, carpenters,
          and more — across India. No middlemen, no fees.
        </motion.p>

        {/* Search */}
        <motion.form
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          onSubmit={(e) => {
            e.preventDefault();
            searchJobHandler(query);
          }}
          className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-lg shadow-primary/5 transition-shadow focus-within:border-primary/50 focus-within:shadow-primary/10"
        >
          <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="hero-search" className="sr-only">
            Search jobs by trade, title, or keyword
          </label>
          <input
            id="hero-search"
            type="text"
            value={query}
            placeholder="Try “electrician” or “driver”…"
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
          />
          <Button type="submit" size="lg" className="rounded-full px-6">
            Search
          </Button>
        </motion.form>

        {/* Popular searches */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm"
        >
          <span className="text-muted-foreground">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => searchJobHandler(term)}
              className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {term}
            </button>
          ))}
        </motion.div>

        {/* Live platform stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mx-auto mt-12 grid max-w-3xl grid-cols-2 justify-items-center gap-x-6 gap-y-6 sm:grid-cols-4"
          >
            <StatItem icon={Briefcase} value={formatCount(stats.totalJobs)} label="Open jobs" />
            <StatItem icon={Building2} value={formatCount(stats.totalCompanies)} label="Hiring companies" />
            <StatItem icon={Users} value={formatCount(stats.totalUsers)} label="Registered workers" />
            <StatItem icon={MapPin} value="All India" label="Cities covered" />
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default HeroSection;
