import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setSingleCompany } from "@/redux/companySlice";
import { useI18n } from "@/i18n/I18nProvider";

function CreateCompany() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { t } = useI18n();

  const registerNewCompany = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error(t("employer.enterCompanyName"));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(`${COMPANY_API_END_POINT}`, { companyName });
      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.data.company));
        toast.success(res.data.message);
        navigate(`/admin/companies/${res.data.data.company._id}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || t("employer.createCompanyError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto max-w-lg px-4 py-10">
        <button
          type="button"
          onClick={() => navigate("/admin/companies")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("employer.backToCompanies")}
        </button>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {t("employer.nameCompany")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("employer.nameCompanySubForm")}
          </p>

          <form onSubmit={registerNewCompany} className="mt-6 space-y-1.5">
            <Label htmlFor="company-name">{t("employer.companyName")}</Label>
            <Input
              id="company-name"
              type="text"
              autoFocus
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Om Builders"
            />

            <div className="flex items-center justify-end gap-2 pt-6">
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
                    {t("employer.creating")}
                  </>
                ) : (
                  t("employer.continueBtn")
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCompany;
