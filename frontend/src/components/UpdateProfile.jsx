import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2, FileText, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import api from "@/lib/api";
import { USER_API_END_POINT } from "../utils/constant";
import { setUser } from "@/redux/authSlice";
import { useI18n } from "@/i18n/I18nProvider";

const WAGE_TYPES = [
  { value: "monthly", labelKey: "perMonth" },
  { value: "daily", labelKey: "perDay" },
  { value: "hourly", labelKey: "perHour" },
  { value: "weekly", labelKey: "perWeek" },
  { value: "fixed", labelKey: "fixedPay" },
];

function UpdateProfile({ open, setOpen }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const p = user?.profile || {};
  const [input, setInput] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: p.bio || "",
    skills: p.skills?.join(", ") || "",
    primaryTrade: p.primaryTrade || "",
    experienceYears: p.experienceYears ?? "",
    expectedWage: p.expectedWage ?? "",
    expectedWageType: p.expectedWageType || "monthly",
    available: p.available ?? true,
    preferredLocation: p.preferredLocation || "",
    languagesSpoken: p.languagesSpoken?.join(", ") || "",
    toolsOwned: p.toolsOwned?.join(", ") || "",
    file: null,
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const fileChangeHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] || null });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);
    formData.append("primaryTrade", input.primaryTrade);
    formData.append("experienceYears", input.experienceYears);
    formData.append("expectedWage", input.expectedWage);
    formData.append("expectedWageType", input.expectedWageType);
    formData.append("available", String(input.available));
    formData.append("preferredLocation", input.preferredLocation);
    formData.append("languagesSpoken", input.languagesSpoken);
    formData.append("toolsOwned", input.toolsOwned);
    if (input.file) {
      formData.append("file", input.file);
    }
    try {
      setLoading(true);
      const res = await api.put(`${USER_API_END_POINT}/profile/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(res.data.data.user));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("employer.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("profile.editTitle")}</DialogTitle>
          <DialogDescription>{t("profile.editSubtitle")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-fullname">{t("profile.fullName")}</Label>
              <Input
                id="edit-fullname"
                name="fullname"
                type="text"
                value={input.fullname}
                onChange={changeEventHandler}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">{t("profile.phone")}</Label>
              <Input
                id="edit-phone"
                name="phoneNumber"
                type="tel"
                value={input.phoneNumber}
                onChange={changeEventHandler}
                placeholder="98765 43210"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-email">{t("profile.email")}</Label>
            <Input
              id="edit-email"
              name="email"
              type="email"
              value={input.email}
              onChange={changeEventHandler}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-bio">{t("profile.bio")}</Label>
            <textarea
              id="edit-bio"
              name="bio"
              value={input.bio}
              onChange={changeEventHandler}
              rows={3}
              maxLength={500}
              placeholder={t("profile.bioPlaceholder")}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* ─── Work details (blue-collar) ─────────────────────────────── */}
          <div className="border-t border-border pt-4">
            <p className="mb-3 text-sm font-semibold text-foreground">
              {t("profile.workDetails")}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-trade">{t("profile.primaryTrade")}</Label>
                <Input
                  id="edit-trade"
                  name="primaryTrade"
                  value={input.primaryTrade}
                  onChange={changeEventHandler}
                  placeholder={t("profile.tradePlaceholder")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-experience">{t("profile.experience")}</Label>
                <Input
                  id="edit-experience"
                  name="experienceYears"
                  type="number"
                  min="0"
                  value={input.experienceYears}
                  onChange={changeEventHandler}
                  placeholder={t("profile.experiencePlaceholder")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-wage">{t("profile.expectedPay")}</Label>
                <Input
                  id="edit-wage"
                  name="expectedWage"
                  type="number"
                  min="0"
                  value={input.expectedWage}
                  onChange={changeEventHandler}
                  placeholder={t("profile.wagePlaceholder")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("employer.payPeriod")}</Label>
                <Select
                  value={input.expectedWageType}
                  onValueChange={(v) => setInput({ ...input, expectedWageType: v })}
                >
                  <SelectTrigger aria-label={t("employer.payPeriod")}>
                    <SelectValue placeholder={t("employer.selectPeriod")} />
                  </SelectTrigger>
                  <SelectContent>
                    {WAGE_TYPES.map(({ value, labelKey }) => (
                      <SelectItem key={value} value={value}>
                        {t(`employer.${labelKey}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-location">{t("profile.preferredLocation")}</Label>
                <Input
                  id="edit-location"
                  name="preferredLocation"
                  value={input.preferredLocation}
                  onChange={changeEventHandler}
                  placeholder={t("profile.locationPlaceholder")}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="edit-available"
                  type="checkbox"
                  checked={input.available}
                  onChange={(e) => setInput({ ...input, available: e.target.checked })}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <Label htmlFor="edit-available" className="cursor-pointer">
                  {t("profile.availableForWork")}
                </Label>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="edit-languages">{t("profile.languagesSpoken")}</Label>
              <Input
                id="edit-languages"
                name="languagesSpoken"
                value={input.languagesSpoken}
                onChange={changeEventHandler}
                placeholder={t("profile.languagesPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">{t("profile.csvHint")}</p>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="edit-tools">{t("profile.toolsOwned")}</Label>
              <Input
                id="edit-tools"
                name="toolsOwned"
                value={input.toolsOwned}
                onChange={changeEventHandler}
                placeholder={t("profile.toolsPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">{t("profile.csvHint")}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-skills">{t("profile.skills")}</Label>
            <Input
              id="edit-skills"
              name="skills"
              type="text"
              value={input.skills}
              onChange={changeEventHandler}
              placeholder="electrician, wiring, circuit installation"
            />
            <p className="text-xs text-muted-foreground">{t("profile.skillsHint")}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-resume" className="flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {t("profile.resume")}{" "}
              <span className="font-normal text-muted-foreground">{t("profile.resumePdf")}</span>
            </Label>
            <Input
              id="edit-resume"
              type="file"
              accept="application/pdf"
              onChange={fileChangeHandler}
              className="cursor-pointer file:mr-3 file:font-medium file:text-foreground"
            />
            {input.file ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {t("profile.newFilePrefix", { name: input.file.name })}
              </p>
            ) : user?.profile?.resumeOriginalName ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {t("profile.currentFilePrefix", { name: user.profile.resumeOriginalName })}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t("employer.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {t("employer.saving")}
                </>
              ) : (
                t("employer.saveChanges")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateProfile;
