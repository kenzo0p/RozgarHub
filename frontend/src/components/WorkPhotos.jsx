import React, { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { useI18n } from "@/i18n/I18nProvider";

const MAX_PHOTOS = 8;

/**
 * Work-portfolio gallery + uploader for a worker's profile. Photos of finished
 * jobs are a far better signal than a resume for trades like masonry or
 * painting. Multi-select add, tap-to-remove, capped at 8.
 */
function WorkPhotos() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const photos = user?.profile?.workPhotos || [];
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(null);
  const inputRef = useRef(null);

  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file
    if (files.length === 0) return;
    if (photos.length + files.length > MAX_PHOTOS) {
      toast.error(t("workPhotos.limit"));
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((f) => formData.append("photos", f));
      const res = await api.post(`${USER_API_END_POINT}/work-photos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        dispatch(setUser(res.data.data.user));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("workPhotos.error"));
    } finally {
      setUploading(false);
    }
  };

  const remove = async (url) => {
    try {
      setRemoving(url);
      const res = await api.delete(`${USER_API_END_POINT}/work-photos`, { data: { url } });
      if (res.data.success) {
        dispatch(setUser(res.data.data.user));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("workPhotos.error"));
    } finally {
      setRemoving(null);
    }
  };

  const atLimit = photos.length >= MAX_PHOTOS;

  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight text-foreground">
        {t("workPhotos.title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("workPhotos.hint")}</p>

      {photos.length === 0 && !uploading ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <ImagePlus className="h-8 w-8" aria-hidden="true" />
          <span className="text-sm font-medium">{t("workPhotos.add")}</span>
        </button>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
              <button
                type="button"
                onClick={() => remove(url)}
                disabled={removing === url}
                aria-label={t("workPhotos.remove")}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 focus:opacity-100"
              >
                {removing === url ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          ))}

          {!atLimit && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="h-6 w-6" aria-hidden="true" />
              )}
              <span className="text-xs font-medium">
                {uploading ? t("workPhotos.uploading") : t("workPhotos.add")}
              </span>
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}

export default WorkPhotos;
