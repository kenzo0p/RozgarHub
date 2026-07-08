/* eslint-disable react-refresh/only-export-components -- provider + its hook are colocated by design */
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

const STORAGE_KEY = "rozgarhub-lang";
const SUPPORTED = ["en", "hi"];

const I18nContext = createContext(null);

/**
 * Look up a dot-namespaced key in the active language, falling back to English
 * (so a partially-translated screen never shows a raw key), then interpolate
 * {vars}.
 */
function resolve(lang, key, vars) {
  const read = (dict) => key.split(".").reduce((acc, part) => acc?.[part], dict);
  let value = read(translations[lang]);
  if (value == null) value = read(translations.en);
  if (value == null) return key;
  if (vars && typeof value === "string") {
    return value.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? "").toString());
  }
  return value;
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(saved) ? saved : "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!SUPPORTED.includes(next)) return;
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback((key, vars) => resolve(lang, key, vars), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Access the translation function and language controls. */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
