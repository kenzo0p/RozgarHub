import React, { useEffect, useState } from "react";
import { Download, X, WifiOff } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const DISMISS_KEY = "rozgarhub-install-dismissed";

/**
 * Two lightweight PWA affordances for low-connectivity workers:
 *   • an "Install app" chip when the browser offers installation (so the app
 *     opens instantly and works offline), and
 *   • an offline banner so a worker knows why they're seeing saved content.
 */
function PwaBanner() {
  const { t } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" && navigator.onLine === false,
  );

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => setDeferredPrompt(null);
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => {});
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <>
      {offline && (
        <div
          role="status"
          className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-center text-xs font-medium text-white"
        >
          <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
          {t("pwa.offline")}
        </div>
      )}

      {deferredPrompt && !dismissed && (
        <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg sm:inset-x-auto sm:right-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Download className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{t("pwa.install")}</p>
            <p className="truncate text-xs text-muted-foreground">{t("pwa.installHint")}</p>
          </div>
          <button
            type="button"
            onClick={install}
            className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("pwa.install")}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("pwa.dismiss")}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}

export default PwaBanner;
