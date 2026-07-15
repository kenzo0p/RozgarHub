import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Mail,
  Phone,
  Pen,
  FileText,
  FileX2,
  Briefcase,
  Clock,
  CheckCircle2,
  CircleSlash,
  Wrench,
  MapPin,
  Languages,
  Coins,
} from "lucide-react";
import { formatWage } from "@/utils/wage";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfile from "./UpdateProfile";
import ReviewsList from "./shared/ReviewsList";
import WorkerVerification from "./WorkerVerification";
import WorkPhotos from "./WorkPhotos";
import Credentials from "./Credentials";
import VerifiedBadge from "./shared/VerifiedBadge";
import { StarRatingDisplay } from "./shared/StarRating";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import { useI18n } from "@/i18n/I18nProvider";

function StatCard({ icon: Icon, value, label, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xl font-bold leading-none text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/** A single labelled work-detail row; renders nothing when the value is empty. */
function WorkDetail({ icon: Icon, label, value }) {
  const { t } = useI18n();
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={`text-sm font-medium ${value ? "text-foreground" : "italic text-muted-foreground"}`}>
          {value || t("profile.notSet")}
        </dd>
      </div>
    </div>
  );
}

function Profile() {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs } = useSelector((store) => store.job);

  const prof = user?.profile || {};
  const isWorker = user?.role === "employee";
  const skills = user?.profile?.skills || [];
  const resume = user?.profile?.resume;
  const applied = allAppliedJobs?.length || 0;
  const pending = allAppliedJobs?.filter((a) => a.status === "pending").length || 0;
  const accepted = allAppliedJobs?.filter((a) => a.status === "accepted").length || 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pb-16">
        {/* ─── Profile header card ─────────────────────────────────────── */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* Cover band */}
          <div className="h-24 bg-gradient-to-r from-primary to-blue-500 sm:h-28" />

          <div className="px-6 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              {/* Avatar overlapping the cover */}
              <div className="-mt-12 flex items-end gap-4">
                <Avatar className="h-24 w-24 border-4 border-card shadow-md">
                  <AvatarImage src={user?.profile?.profilePhoto} alt="" />
                  <AvatarFallback className="bg-primary/10 text-3xl font-bold text-primary">
                    {user?.fullname?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button onClick={() => setOpen(true)} variant="outline" className="gap-2 sm:mb-1">
                <Pen className="h-4 w-4" aria-hidden="true" />
                {t("profile.edit")}
              </Button>
            </div>

            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {user?.fullname}
                </h1>
                <VerifiedBadge status={user?.verificationStatus} />
              </div>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
              {user?.ratingCount > 0 && (
                <div className="mt-1.5">
                  <StarRatingDisplay
                    value={user.ratingAverage}
                    count={user.ratingCount}
                    size="lg"
                  />
                </div>
              )}
              {user?.profile?.bio ? (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {user.profile.bio}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-muted-foreground">
                  {t("profile.noBio")}
                </p>
              )}
            </div>

            {/* Contact row */}
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {user?.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {user?.phoneNumber}
              </span>
            </div>

            {/* Skills */}
            <div className="mt-5">
              <h2 className="text-sm font-semibold text-foreground">{t("profile.skills")}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {skills.length > 0 ? (
                  skills.map((item) => (
                    <Badge key={item} variant="secondary" className="font-medium">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    {t("profile.noSkills")}
                  </p>
                )}
              </div>
            </div>

            {/* Resume */}
            <div className="mt-5">
              <h2 className="text-sm font-semibold text-foreground">{t("profile.resume")}</h2>
              {resume ? (
                <a
                  href={resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary/40"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  {user?.profile?.resumeOriginalName || t("profile.viewResume")}
                </a>
              ) : (
                <p className="mt-2 inline-flex items-center gap-2 text-sm italic text-muted-foreground">
                  <FileX2 className="h-4 w-4" aria-hidden="true" />
                  {t("profile.noResume")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Worker-only: work details + identity verification ───────── */}
        {isWorker && (
          <>
            <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {t("profile.workDetails")}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    prof.available === false
                      ? "bg-muted text-muted-foreground"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {prof.available === false ? (
                    <CircleSlash className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {prof.available === false
                    ? t("profile.notAvailable")
                    : t("profile.availableForWork")}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <WorkDetail icon={Briefcase} label={t("profile.primaryTrade")} value={prof.primaryTrade} />
                <WorkDetail
                  icon={Clock}
                  label={t("profile.experience")}
                  value={
                    prof.experienceYears != null
                      ? `${prof.experienceYears} ${t("profile.yearsSuffix")}`
                      : null
                  }
                />
                <WorkDetail
                  icon={Coins}
                  label={t("profile.expectedPay")}
                  value={
                    prof.expectedWage != null
                      ? formatWage(prof.expectedWage, prof.expectedWageType)
                      : null
                  }
                />
                <WorkDetail icon={MapPin} label={t("profile.preferredLocation")} value={prof.preferredLocation} />
              </dl>

              {prof.languagesSpoken?.length > 0 && (
                <div className="mt-4">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {t("profile.languagesSpoken")}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {prof.languagesSpoken.map((l) => (
                      <Badge key={l} variant="secondary" className="font-medium">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {prof.toolsOwned?.length > 0 && (
                <div className="mt-4">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Wrench className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {t("profile.toolsOwned")}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {prof.toolsOwned.map((tool) => (
                      <Badge key={tool} variant="secondary" className="font-medium">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <WorkerVerification />
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Credentials />
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <WorkPhotos />
            </div>
          </>
        )}

        {/* ─── Application stats ───────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Briefcase}
            value={applied}
            label={t("profile.jobsApplied")}
            tone="bg-primary/10 text-primary"
          />
          <StatCard
            icon={Clock}
            value={pending}
            label={t("profile.awaiting")}
            tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
          <StatCard
            icon={CheckCircle2}
            value={accepted}
            label={t("profile.accepted")}
            tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* ─── Applied jobs ────────────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {t("profile.appliedJobs")}
          </h2>
          <div className="mt-4">
            <AppliedJobTable />
          </div>
        </div>

        {/* ─── Reviews received ───────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {t("reviews.received")}
          </h2>
          <div className="mt-4">
            <ReviewsList userId={user?._id} />
          </div>
        </div>
      </div>

      <UpdateProfile open={open} setOpen={setOpen} />
    </div>
  );
}

export default Profile;
