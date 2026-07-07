import React, { useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Building2, Pencil, CalendarDays, Globe, MapPin, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function CompanyCard({ company }) {
  const navigate = useNavigate();
  const created = company?.createdAt
    ? new Date(company.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 rounded-lg border border-border">
          <AvatarImage src={company.logo} alt="" />
          <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-primary">
            {company.name?.charAt(0)?.toUpperCase() || "C"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground">{company.name}</h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" aria-hidden="true" />
            Added {created}
          </p>
        </div>
      </div>

      {company.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {company.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {company.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {company.location}
          </span>
        )}
        {company.website && (
          <span className="inline-flex items-center gap-1">
            <Globe className="h-3 w-3" aria-hidden="true" />
            Website
          </span>
        )}
      </div>

      <Button
        onClick={() => navigate(`/admin/companies/${company._id}`)}
        variant="outline"
        size="sm"
        className="mt-4 w-full gap-2"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Edit details
      </Button>
    </div>
  );
}

function CompaniesTable({ loading }) {
  const { companies, searchCompanyByText } = useSelector((store) => store.company);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!companies) return [];
    if (!searchCompanyByText) return companies;
    return companies.filter((c) =>
      c?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase())
    );
  }, [companies, searchCompanyByText]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <Building2 className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium text-foreground">No companies yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create a company profile before you can post jobs and receive applications.
        </p>
        <Button onClick={() => navigate("/admin/companies/create")} className="mt-1 gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create your first company
        </Button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No companies match &ldquo;{searchCompanyByText}&rdquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((company) => (
        <CompanyCard key={company._id} company={company} />
      ))}
    </div>
  );
}

export default CompaniesTable;
