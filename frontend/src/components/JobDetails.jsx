import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { setSingleJob } from "@/redux/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import useSavedJobs from "../hooks/useSavedJobs";
import { getCityCoords } from "@/utils/cityCoords";
import { formatWage } from "@/utils/wage";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Users,
  IndianRupee,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Loader2,
  SearchX,
  Flag,
  BadgeCheck,
} from "lucide-react";
import VerifiedBadge from "./shared/VerifiedBadge";
import ListenButton from "./shared/ListenButton";
import ReportJobDialog from "./ReportJobDialog";
import { useI18n } from "@/i18n/I18nProvider";

function MetaChip({ icon: Icon, children, highlight = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
        highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

function FactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function JobDetails() {
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const [isApplied, setIsApplied] = useState(false);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isJobSaved, toggleSave } = useSavedJobs();
  const saved = isJobSaved(jobId);

  const applyJobHandler = async () => {
    try {
      setApplying(true);
      const res = await api.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {});

      if (res.data.success) {
        setIsApplied(true);
        setTotalApplications((count) => count + 1);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchSingleJob = async () => {
      try {
        setLoading(true);
        const res = await api.get(`${JOB_API_END_POINT}/${jobId}`);
        if (!cancelled && res.data.success) {
          // The API computes viewer-specific state server-side — the raw
          // applications list is no longer exposed to job seekers.
          dispatch(setSingleJob(res.data.data.job));
          setIsApplied(res.data.data.isApplied);
          setTotalApplications(res.data.data.totalApplications);
        }
      } catch (error) {
        console.log(error);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSingleJob();
    return () => {
      cancelled = true;
    };
  }, [jobId, dispatch]);

  const postedDate = singleJob?.createdAt
    ? new Date(singleJob.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  // What (if anything) stops this worker from applying — mirrors the backend
  // gates so we can prompt them to fix it instead of hitting a bare 403.
  const req = singleJob?.requiredCredential;
  const creds = user?.profile?.credentials || [];
  const identityIncomplete =
    user?.role === "employee" && user?.verificationStatus !== "verified";
  const hasRequiredCredential =
    !req ||
    creds.some(
      (c) =>
        c.status === "verified" &&
        (req === "driving_license"
          ? c.type === "driving_license"
          : c.type === "certificate" || c.type === "other"),
    );
  const applyBlocker = identityIncomplete
    ? "identity"
    : !hasRequiredCredential
      ? req
      : null;

  // Business jobs show the company; individual jobs show the poster's name.
  const jobIsCompany = !!singleJob?.company;
  const posterName = jobIsCompany ? singleJob?.company?.name : singleJob?.created_By?.fullname;
  const posterLogo = jobIsCompany ? singleJob?.company?.logo : undefined;
  const posterInitial = posterName?.charAt(0)?.toUpperCase() || (jobIsCompany ? "C" : "?");
  const posterVerification = jobIsCompany
    ? singleJob?.company?.verificationStatus
    : singleJob?.created_By?.verificationStatus;

  const location = singleJob?.location || "India";
  const coords = getCityCoords(location);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Navbar />
        <div className="flex items-center justify-center gap-2 py-32 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          {t("details.loading")}
        </div>
      </div>
    );
  }

  if (notFound || !singleJob) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Navbar />
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-32 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="font-semibold text-foreground">{t("details.notAvailable")}</p>
          <p className="text-sm text-muted-foreground">
            {t("details.notAvailableSub")}
          </p>
          <Button onClick={() => navigate("/jobs")} className="mt-2">
            {t("details.browseOther")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-16">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate("/jobs")}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("details.back")}
        </button>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* ─── Main column ───────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Header card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 rounded-xl border border-border">
                  <AvatarImage src={posterLogo} alt="" />
                  <AvatarFallback className="rounded-xl bg-primary/10 text-xl font-bold text-primary">
                    {posterInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{posterName}</p>
                    <VerifiedBadge status={posterVerification} showUnverified />
                    {!jobIsCompany && (
                      <span className="text-xs text-muted-foreground">· {t("card.individual")}</span>
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {location}
                  </p>
                </div>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {singleJob?.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <MetaChip icon={IndianRupee} highlight>
                  {formatWage(singleJob?.salary, singleJob?.wageType)}
                </MetaChip>
                <MetaChip icon={Briefcase}>{singleJob?.jobType}</MetaChip>
                <MetaChip icon={Users}>
                  {singleJob?.position}{" "}
                  {singleJob?.position === 1 ? t("details.opening") : t("details.openings")}
                </MetaChip>
                <MetaChip icon={GraduationCap}>
                  {singleJob?.experienceLevel}+ {t("details.years")} {t("details.experience")}
                </MetaChip>
                {singleJob?.requiredCredential && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-400">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    {singleJob.requiredCredential === "driving_license"
                      ? t("credentials.badgeDrivingLicense")
                      : t("credentials.badgeCertificate")}
                  </span>
                )}
              </div>
            </div>

            {/* Description card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {t("details.description")}
                </h2>
                <ListenButton
                  text={[singleJob?.title, singleJob?.description, singleJob?.requirements]
                    .filter(Boolean)
                    .join(". ")}
                />
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {singleJob?.description}
              </p>

              {singleJob?.requirements && (
                <>
                  <h2 className="mt-6 text-lg font-bold tracking-tight text-foreground">
                    {t("details.requirements")}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {singleJob.requirements}
                  </p>
                </>
              )}
            </div>

            {/* Location map (OpenStreetMap embed — no API key needed) */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between p-6 pb-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    {t("details.location")}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {location}, India
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${location}, India`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("details.openInMaps")}
                </a>
              </div>
              {coords ? (
                <iframe
                  title={`Map of ${location}`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.12},${coords.lat - 0.09},${coords.lng + 0.12},${coords.lat + 0.09}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
                  className="h-72 w-full border-0"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 border-t border-border py-12 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">
                    Map preview isn&apos;t available for this location — use
                    &ldquo;Open in Maps&rdquo; above.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Sidebar ───────────────────────────────────────────────── */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            {/* Apply card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">{t("details.salary")}</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {formatWage(singleJob?.salary, singleJob?.wageType)}
              </p>

              <div className="mt-4 divide-y divide-border border-y border-border">
                <FactRow icon={Users} label={t("details.applicants")} value={totalApplications} />
                <FactRow icon={Briefcase} label={t("details.jobType")} value={singleJob?.jobType} />
                <FactRow
                  icon={GraduationCap}
                  label={t("details.experience")}
                  value={`${singleJob?.experienceLevel}+ ${t("details.years")}`}
                />
                <FactRow icon={CalendarDays} label={t("details.posted")} value={postedDate} />
              </div>

              {applyBlocker && !isApplied ? (
                <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="flex items-start gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {applyBlocker === "identity"
                      ? t("credentials.applyNeedIdentity")
                      : applyBlocker === "driving_license"
                        ? t("credentials.applyNeedDrivingLicense")
                        : t("credentials.applyNeedCertificate")}
                  </p>
                  <Button
                    onClick={() => navigate("/profile")}
                    size="lg"
                    className="mt-3 w-full"
                  >
                    {t("credentials.completeProfile")}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={applyJobHandler}
                  disabled={isApplied || applying}
                  size="lg"
                  className="mt-5 w-full"
                >
                  {applying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      {t("details.applying")}
                    </>
                  ) : isApplied ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t("details.applied")}
                    </>
                  ) : (
                    t("details.applyNow")
                  )}
                </Button>
              )}

              <Button
                onClick={() => toggleSave(jobId)}
                variant="outline"
                size="lg"
                className={`mt-2 w-full gap-2 ${saved ? "border-primary/40 text-primary" : ""}`}
              >
                {saved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 fill-current" aria-hidden="true" />
                    {t("details.saved")}
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" aria-hidden="true" />
                    {t("details.saveForLater")}
                  </>
                )}
              </Button>

              {isApplied && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {t("details.trackOn")}{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="font-medium text-primary hover:underline"
                  >
                    {t("details.profile")}
                  </button>
                  .
                </p>
              )}
            </div>

            {/* Company card — only for business jobs */}
            {jobIsCompany && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground">
                  {t("details.aboutCompany")}
                </h2>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar className="h-11 w-11 rounded-lg border border-border">
                    <AvatarImage src={singleJob?.company?.logo} alt="" />
                    <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-primary">
                      {singleJob?.company?.name?.charAt(0)?.toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {singleJob?.company?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{location}</p>
                  </div>
                </div>
                {singleJob?.company?.description && (
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                    {singleJob.company.description}
                  </p>
                )}
              </div>
            )}

            {/* Report */}
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-red-600 dark:hover:text-red-400"
            >
              <Flag className="h-4 w-4" aria-hidden="true" />
              {t("details.report")}
            </button>
          </div>
        </div>
      </div>

      <ReportJobDialog open={reportOpen} setOpen={setReportOpen} jobId={jobId} />
    </div>
  );
}

export default JobDetails;
