import React from "react";
import { Languages } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useI18n } from "@/i18n/I18nProvider";
import api from "@/lib/api";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
];

/**
 * Language switcher — a globe/letters icon opening a short EN/हिन्दी menu.
 * Kept icon-forward so it reads regardless of the user's language.
 */
function LanguageToggle() {
  const { lang, setLang } = useI18n();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const chooseLang = (code) => {
    setLang(code);
    // Persist to the account so server-generated notifications and SMS reach
    // the user in this language. Fire-and-forget; the UI already updated.
    if (user) {
      dispatch(setUser({ ...user, language: code }));
      api.patch(`${USER_API_END_POINT}/language`, { language: code }).catch(() => {
        // Non-critical: the choice still applies locally this session.
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label="Change language"
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1.5">
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => chooseLang(code)}
            className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted ${
              lang === code ? "font-semibold text-primary" : "text-foreground"
            }`}
          >
            {label}
            {lang === code && <span aria-hidden="true">✓</span>}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export default LanguageToggle;
