import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { ArrowLeft, Loader2, Upload, BadgeCheck, ShieldAlert } from "lucide-react";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "@/redux/companySlice";
import useGetCompanyById from "@/hooks/useGetCompanyById";
import { useI18n } from "@/i18n/I18nProvider";

function CompanySetup() {
  const params = useParams();
  useGetCompanyById(params.id);
  const { t } = useI18n();
  const { singleCompany } = useSelector((store) => store.company);

  const [input, setInput] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    contactPhone: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [gst, setGst] = useState("");
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const verifyHandler = async () => {
    if (!gst.trim()) {
      toast.error(t("employer.enterGst"));
      return;
    }
    try {
      setVerifying(true);
      const res = await api.post(`${COMPANY_API_END_POINT}/${params.id}/verify`, {
        gstNumber: gst,
      });
      if (res.data.success) {
        dispatch(setSingleCompany(res.data.data.company));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("employer.verificationFailed"));
    } finally {
      setVerifying(false);
    }
  };

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] || null });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("website", input.website);
    formData.append("location", input.location);
    formData.append("contactPhone", input.contactPhone);
    if (input.file) {
      formData.append("file", input.file);
    }
    try {
      setLoading(true);
      const res = await api.put(`${COMPANY_API_END_POINT}/${params.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/companies");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("employer.genericError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!singleCompany) return;
    setInput({
      name: singleCompany.name || "",
      description: singleCompany.description || "",
      website: singleCompany.website || "",
      location: singleCompany.location || "",
      contactPhone: singleCompany.contactPhone || "",
      file: null,
    });
  }, [singleCompany]);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <button
          type="button"
          onClick={() => navigate("/admin/companies")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("employer.backToCompanies")}
        </button>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 rounded-xl border border-border">
              <AvatarImage src={singleCompany?.logo} alt="" />
              <AvatarFallback className="rounded-xl bg-primary/10 text-xl font-bold text-primary">
                {input.name?.charAt(0)?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {t("employer.companyDetails")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("employer.companyDetailsSub")}
              </p>
            </div>
          </div>

          {/* Verification */}
          {singleCompany?.verificationStatus === "verified" ? (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">
              <BadgeCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">{t("employer.verifiedBusiness")}</span>{" "}
                {t("employer.verifiedBusinessSub")}
              </span>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
                {t("employer.getVerified")}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("employer.getVerifiedSub")}
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input
                  value={gst}
                  onChange={(e) => setGst(e.target.value.toUpperCase())}
                  placeholder="27AABCU9603R1ZM"
                  maxLength={15}
                  className="uppercase"
                />
                <Button type="button" onClick={verifyHandler} disabled={verifying}>
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      {t("employer.verifying")}
                    </>
                  ) : (
                    t("employer.verify")
                  )}
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={submitHandler} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="company-name">{t("employer.companyName")}</Label>
                <Input
                  id="company-name"
                  type="text"
                  name="name"
                  value={input.name}
                  onChange={changeEventHandler}
                  placeholder="Om Builders"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-location">{t("employer.location")}</Label>
                <Input
                  id="company-location"
                  type="text"
                  name="location"
                  value={input.location}
                  onChange={changeEventHandler}
                  placeholder="Pune"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="company-website">{t("employer.website")}</Label>
                <Input
                  id="company-website"
                  type="text"
                  name="website"
                  value={input.website}
                  onChange={changeEventHandler}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-contact">{t("employer.contactNumber")}</Label>
                <Input
                  id="company-contact"
                  type="tel"
                  name="contactPhone"
                  value={input.contactPhone}
                  onChange={changeEventHandler}
                  placeholder="98765 43210"
                />
                <p className="text-xs text-muted-foreground">
                  {t("employer.contactNumberSub")}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-description">{t("employer.description")}</Label>
              <textarea
                id="company-description"
                name="description"
                value={input.description}
                onChange={changeEventHandler}
                rows={3}
                maxLength={2000}
                placeholder="A short description of what your company does…"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-logo" className="flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {t("employer.logo")}{" "}
                <span className="font-normal text-muted-foreground">{t("employer.logoImage")}</span>
              </Label>
              <Input
                id="company-logo"
                type="file"
                accept="image/*"
                onChange={changeFileHandler}
                className="cursor-pointer file:mr-3 file:font-medium file:text-foreground"
              />
              {input.file && (
                <p className="text-xs text-muted-foreground">{t("employer.newFilePrefix", { name: input.file.name })}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/companies")}
                disabled={loading}
              >
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompanySetup;
