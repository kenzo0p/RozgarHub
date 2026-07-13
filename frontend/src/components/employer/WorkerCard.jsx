import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Briefcase, Clock, Coins, MapPin, CheckCircle2, CircleSlash } from "lucide-react";
import ContactButtons from "../shared/ContactButtons";
import VerifiedBadge from "../shared/VerifiedBadge";
import { StarRatingDisplay } from "../shared/StarRating";
import { formatWage } from "@/utils/wage";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * A worker result card in the employer discovery view. Shows the trade, rate,
 * availability and reputation an employer needs to decide — plus a call/WhatsApp
 * action when the worker is open to work.
 */
function WorkerCard({ worker }) {
  const { t } = useI18n();
  const p = worker?.profile || {};
  const available = p.available !== false;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={p.profilePhoto} alt="" />
          <AvatarFallback className="bg-primary/10 font-bold text-primary">
            {worker?.fullname?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-foreground">{worker?.fullname}</h3>
            <VerifiedBadge status={worker?.verificationStatus} />
          </div>
          {p.primaryTrade && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
              {p.primaryTrade}
            </p>
          )}
          {worker?.ratingCount > 0 && (
            <div className="mt-0.5">
              <StarRatingDisplay value={worker.ratingAverage} count={worker.ratingCount} />
            </div>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            available
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {available ? (
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          ) : (
            <CircleSlash className="h-3 w-3" aria-hidden="true" />
          )}
          {available ? t("workers.available") : t("workers.busy")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {p.experienceYears != null && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {p.experienceYears} {t("profile.yearsSuffix")}
          </span>
        )}
        {p.expectedWage != null && (
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Coins className="h-3 w-3" aria-hidden="true" />
            {formatWage(p.expectedWage, p.expectedWageType)}
          </span>
        )}
        {p.preferredLocation && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {p.preferredLocation}
          </span>
        )}
      </div>

      {p.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.skills.slice(0, 6).map((s) => (
            <Badge key={s} variant="secondary" className="font-medium">
              {s}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-border pt-3">
        {worker?.phone ? (
          <ContactButtons
            phone={worker.phone}
            message={t("workers.contactMessage", { name: worker?.fullname || "" })}
          />
        ) : (
          <p className="text-xs italic text-muted-foreground">{t("workers.noContact")}</p>
        )}
      </div>
    </div>
  );
}

export default WorkerCard;
