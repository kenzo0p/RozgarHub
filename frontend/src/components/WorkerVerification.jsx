import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, BadgeCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Worker-side identity verification — the counterpart to employer GST
 * verification, so trust runs both ways. The worker submits an Aadhaar; the
 * backend keeps only the last 4 digits and marks them verified.
 */
function WorkerVerification({ audience = "worker" }) {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const [aadhaar, setAadhaar] = useState("");
  const [loading, setLoading] = useState(false);

  const verified = user?.verificationStatus === "verified";
  const verifiedSubKey = audience === "employer" ? "idv.verifiedSubEmployer" : "idv.verifiedSub";
  const getSubKey = audience === "employer" ? "idv.getSubEmployer" : "idv.getSub";

  const submit = async () => {
    if (!aadhaar.trim()) {
      toast.error(t("idv.enterAadhaar"));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(`${USER_API_END_POINT}/verify`, {
        idNumber: aadhaar.replace(/\s+/g, ""),
      });
      if (res.data.success) {
        dispatch(setUser(res.data.data.user));
        toast.success(res.data.message);
        setAadhaar("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("idv.error"));
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">
        <BadgeCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{t("idv.verifiedTitle")}</p>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
            {t(verifiedSubKey)}
            {user?.idLast4 ? ` · ${t("idv.endingIn", { last4: user.idLast4 })}` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
        <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
        {t("idv.getTitle")}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t(getSubKey)}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          value={aadhaar}
          onChange={(e) => setAadhaar(e.target.value)}
          placeholder="2345 6789 0123"
          inputMode="numeric"
          maxLength={14}
          aria-label={t("idv.aadhaarLabel")}
        />
        <Button type="button" onClick={submit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {t("idv.verifying")}
            </>
          ) : (
            t("idv.verify")
          )}
        </Button>
      </div>
    </div>
  );
}

export default WorkerVerification;
