import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import CompaniesTable from "./CompaniesTable";
import { useNavigate } from "react-router-dom";
import useGetAllCompanies from "@/hooks/useGetAllCompanies";
import { useDispatch } from "react-redux";
import { setSearchCompanyByText } from "@/redux/companySlice";
import { Search, Plus } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

function Companies() {
  const { loading } = useGetAllCompanies();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useI18n();

  useEffect(() => {
    dispatch(setSearchCompanyByText(input));
  }, [input, dispatch]);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pb-16">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pt-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("employer.yourCompanies")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("employer.manageCompanies")}
            </p>
          </div>
          <Button onClick={() => navigate("/admin/companies/create")} className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("employer.newCompany")}
          </Button>
        </div>

        {/* Search */}
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:border-primary/50 sm:max-w-xs">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="company-search" className="sr-only">
            {t("employer.filterName")}
          </label>
          <input
            id="company-search"
            type="text"
            value={input}
            placeholder={t("employer.filterName")}
            onChange={(e) => setInput(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-6">
          <CompaniesTable loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default Companies;
