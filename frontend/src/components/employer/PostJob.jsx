import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import api from "@/lib/api";
import { JOB_API_END_POINT } from "@/utils/constant";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import { useI18n } from "@/i18n/I18nProvider";

const JOB_TYPES = ["Full-Time", "Part-Time", "Contract"];
const WAGE_TYPES = [
  { value: "monthly", labelKey: "perMonth" },
  { value: "daily", labelKey: "perDay" },
  { value: "hourly", labelKey: "perHour" },
  { value: "weekly", labelKey: "perWeek" },
  { value: "fixed", labelKey: "fixedPay" },
];

function PostJob() {
  // Load the employer's companies so the company dropdown is populated even
  // when arriving here directly (not via the Companies page).
  useGetAllCompanies();
  const { t } = useI18n();
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    wageType: "monthly",
    experience: "",
    position: 1,
    companyId: "",
    requiredCredential: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { companies } = useSelector((store) => store.company);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input.companyId) {
      toast.error(t("employer.selectCompanyToast"));
      return;
    }
    if (!input.jobType) {
      toast.error(t("employer.selectTypeToast"));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(`${JOB_API_END_POINT}`, input);
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/jobs");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("employer.genericError"));
    } finally {
      setLoading(false);
    }
  };

  const noCompanies = !companies || companies.length === 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <button
          type="button"
          onClick={() => navigate("/admin/jobs")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("employer.backToJobs")}
        </button>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("employer.postJob")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("employer.postJobSubForm")}
          </p>

          {noCompanies ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
              <Building2 className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium text-foreground">{t("employer.createCompanyFirst")}</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                {t("employer.createCompanyFirstSub")}
              </p>
              <Button onClick={() => navigate("/admin/companies/create")} className="mt-1">
                {t("employer.createCompany")}
              </Button>
            </div>
          ) : (
            <form onSubmit={submitHandler} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="job-title">{t("employer.jobTitle")}</Label>
                <Input
                  id="job-title"
                  name="title"
                  value={input.title}
                  onChange={changeEventHandler}
                  placeholder="e.g. Senior Electrician"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-description">{t("employer.description")}</Label>
                <textarea
                  id="job-description"
                  name="description"
                  value={input.description}
                  onChange={changeEventHandler}
                  rows={4}
                  maxLength={5000}
                  placeholder="Describe the role, responsibilities, and what a typical day looks like…"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-requirements">{t("employer.requirements")}</Label>
                <textarea
                  id="job-requirements"
                  name="requirements"
                  value={input.requirements}
                  onChange={changeEventHandler}
                  rows={2}
                  placeholder="Skills, certifications, or experience needed…"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="job-location">{t("employer.location")}</Label>
                  <Input
                    id="job-location"
                    name="location"
                    value={input.location}
                    onChange={changeEventHandler}
                    placeholder="Pune"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-salary">{t("employer.payAmount")}</Label>
                  <Input
                    id="job-salary"
                    name="salary"
                    type="number"
                    value={input.salary}
                    onChange={changeEventHandler}
                    placeholder="18000"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("employer.payPeriod")}</Label>
                  <Select
                    value={input.wageType}
                    onValueChange={(v) => setInput({ ...input, wageType: v })}
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
                  <Label htmlFor="job-experience">{t("employer.experienceYears")}</Label>
                  <Input
                    id="job-experience"
                    name="experience"
                    type="number"
                    value={input.experience}
                    onChange={changeEventHandler}
                    placeholder="2"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-position">{t("employer.positions")}</Label>
                  <Input
                    id="job-position"
                    name="position"
                    type="number"
                    min="1"
                    value={input.position}
                    onChange={changeEventHandler}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("employer.jobType")}</Label>
                  <Select
                    value={input.jobType}
                    onValueChange={(v) => setInput({ ...input, jobType: v })}
                  >
                    <SelectTrigger aria-label={t("employer.jobType")}>
                      <SelectValue placeholder={t("employer.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("employer.company")}</Label>
                  <Select
                    value={input.companyId}
                    onValueChange={(v) => setInput({ ...input, companyId: v })}
                  >
                    <SelectTrigger aria-label={t("employer.company")}>
                      <SelectValue placeholder={t("employer.selectCompany")} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company._id} value={company._id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("credentials.requires")}</Label>
                  <Select
                    value={input.requiredCredential || "none"}
                    onValueChange={(v) =>
                      setInput({ ...input, requiredCredential: v === "none" ? "" : v })
                    }
                  >
                    <SelectTrigger aria-label={t("credentials.requires")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("credentials.requiresNone")}</SelectItem>
                      <SelectItem value="driving_license">
                        {t("credentials.typeDrivingLicense")}
                      </SelectItem>
                      <SelectItem value="certificate">
                        {t("credentials.typeCertificate")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/jobs")}
                  disabled={loading}
                >
                  {t("employer.cancel")}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      {t("employer.posting")}
                    </>
                  ) : (
                    t("employer.postJobBtn")
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostJob;
