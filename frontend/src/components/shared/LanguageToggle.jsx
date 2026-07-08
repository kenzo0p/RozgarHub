import React from "react";
import { Languages } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useI18n } from "@/i18n/I18nProvider";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

/**
 * Language switcher — a globe/letters icon opening a short EN/हिन्दी menu.
 * Kept icon-forward so it reads regardless of the user's language.
 */
function LanguageToggle() {
  const { lang, setLang } = useI18n();

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
            onClick={() => setLang(code)}
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
