import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Users, BadgeCheck } from "lucide-react";
import api from "@/lib/api";
import { USER_SEARCH_API_END_POINT } from "@/utils/constant";
import { useI18n } from "@/i18n/I18nProvider";
import WorkerCard from "./WorkerCard";

function FindWorkers() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [availableOnly, setAvailableOnly] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Debounce the filters so typing doesn't fire a request per keystroke.
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (location.trim()) params.set("location", location.trim());
        if (availableOnly) params.set("availableOnly", "true");
        const res = await api.get(`${USER_SEARCH_API_END_POINT}?${params.toString()}`);
        if (active && res.data?.success) {
          setWorkers(res.data.data);
          setTotal(res.data.meta?.total ?? res.data.data.length);
        }
      } catch {
        if (active) setWorkers([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [q, location, availableOnly]);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="pt-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("workers.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("workers.subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:border-primary/50">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="worker-search" className="sr-only">
              {t("workers.searchPlaceholder")}
            </label>
            <input
              id="worker-search"
              type="text"
              value={q}
              placeholder={t("workers.searchPlaceholder")}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("workers.locationPlaceholder")}
            className="sm:max-w-[12rem]"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={availableOnly ? "default" : "outline"}
            onClick={() => setAvailableOnly((v) => !v)}
            className="gap-1.5"
          >
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {t("workers.availableOnly")}
          </Button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {t("workers.allVerified")}
          </span>
          {!loading && (
            <span className="ml-auto text-sm text-muted-foreground">
              {t("workers.count", { n: total })}
            </span>
          )}
        </div>

        {/* Results */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-xl border border-border bg-card" />
              ))}
            </div>
          ) : workers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium text-foreground">{t("workers.noResults")}</p>
              <p className="max-w-sm text-sm text-muted-foreground">{t("workers.noResultsSub")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {workers.map((worker) => (
                <WorkerCard key={worker._id} worker={worker} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FindWorkers;
