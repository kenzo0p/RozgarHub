import React, { useRef, useState } from "react";
import { BadgeCheck, Plus, X, Loader2, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import api from "@/lib/api";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { useI18n } from "@/i18n/I18nProvider";

const TYPE_KEY = {
  driving_license: "credentials.typeDrivingLicense",
  certificate: "credentials.typeCertificate",
  other: "credentials.typeOther",
};

/**
 * Worker credentials (driving licence, trade certificate…). Some jobs require
 * one to apply, so this is where a worker proves they hold it.
 */
function Credentials() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const credentials = user?.profile?.credentials || [];

  const [adding, setAdding] = useState(false);
  const [type, setType] = useState("");
  const [number, setNumber] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const fileRef = useRef(null);

  const reset = () => {
    setType("");
    setNumber("");
    setFile(null);
    setAdding(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!type) {
      toast.error(t("credentials.pickType"));
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("type", type);
      formData.append("number", number);
      if (file) formData.append("file", file);
      const res = await api.post(`${USER_API_END_POINT}/credentials`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        dispatch(setUser(res.data.data.user));
        toast.success(res.data.message);
        reset();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("credentials.addError"));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      setRemovingId(id);
      const res = await api.delete(`${USER_API_END_POINT}/credentials/${id}`);
      if (res.data.success) dispatch(setUser(res.data.data.user));
    } catch (error) {
      toast.error(error.response?.data?.message || t("credentials.addError"));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {t("credentials.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("credentials.hint")}</p>
        </div>
        {!adding && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("credentials.add")}
          </Button>
        )}
      </div>

      {credentials.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {credentials.map((c) => (
            <li
              key={c._id}
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
            >
              <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{t(TYPE_KEY[c.type])}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.number}
                  {c.documentUrl && (
                    <>
                      {" · "}
                      <a
                        href={c.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <FileText className="h-3 w-3" aria-hidden="true" />
                        {t("credentials.photoLabel")}
                      </a>
                    </>
                  )}
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {t("credentials.verified")}
              </span>
              <button
                type="button"
                onClick={() => remove(c._id)}
                disabled={removingId === c._id}
                aria-label={t("credentials.remove")}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-red-600 dark:hover:text-red-400"
              >
                {removingId === c._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !adding && <p className="mt-4 text-sm italic text-muted-foreground">{t("credentials.none")}</p>
      )}

      {adding && (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-lg border border-border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("credentials.typeLabel")}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger aria-label={t("credentials.typeLabel")}>
                  <SelectValue placeholder={t("credentials.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driving_license">{t("credentials.typeDrivingLicense")}</SelectItem>
                  <SelectItem value="certificate">{t("credentials.typeCertificate")}</SelectItem>
                  <SelectItem value="other">{t("credentials.typeOther")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cred-number">{t("credentials.numberLabel")}</Label>
              <Input
                id="cred-number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder={t("credentials.numberPlaceholder")}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cred-photo" className="flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {t("credentials.photoLabel")}
            </Label>
            <Input
              id="cred-photo"
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer file:mr-3 file:font-medium file:text-foreground"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={reset} disabled={loading}>
              {t("credentials.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {t("credentials.adding")}
                </>
              ) : (
                t("credentials.submit")
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Credentials;
