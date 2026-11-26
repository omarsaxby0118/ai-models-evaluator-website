"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGES, translate, type Lang, type TKey } from "@/lib/i18n";

export type ThemeMode = "light" | "dark" | "system";

export const ACCENTS = [
  { id: "indigo", swatch: "#6366f1" },
  { id: "violet", swatch: "#8b5cf6" },
  { id: "emerald", swatch: "#10b981" },
  { id: "rose", swatch: "#f43f5e" },
  { id: "amber", swatch: "#f59e0b" },
] as const;
export type Accent = (typeof ACCENTS)[number]["id"];

/** Must match the key read by the inline script in app/layout.tsx. */
export const STORAGE_KEY = "ame-prefs";

type Prefs = { lang: Lang; theme: ThemeMode; accent: Accent };
const DEFAULTS: Prefs = { lang: "en", theme: "system", accent: "indigo" };

type Ctx = Prefs & {
  setLang: (lang: Lang) => void;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: Accent) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
};

const PreferencesContext = createContext<Ctx | null>(null);

function readStored(): Prefs {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      lang: LANGUAGES.some((l) => l.code === raw.lang) ? raw.lang : DEFAULTS.lang,
      theme: ["light", "dark", "system"].includes(raw.theme) ? raw.theme : DEFAULTS.theme,
      accent: ACCENTS.some((a) => a.id === raw.accent) ? raw.accent : DEFAULTS.accent,
    };
  } catch {
    return DEFAULTS;
  }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrefs(readStored());
    setLoaded(true);
  }, []);

  // Apply to <html> and persist.
  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    root.lang = prefs.lang;
    root.dataset.accent = prefs.accent;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      root.classList.toggle("dark", prefs.theme === "dark" || (prefs.theme === "system" && media.matches));
    apply();
    if (prefs.theme !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefs, loaded]);

  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) => translate(prefs.lang, key, vars),
    [prefs.lang],
  );

  const value = useMemo<Ctx>(
    () => ({
      ...prefs,
      setLang: (lang) => setPrefs((p) => ({ ...p, lang })),
      setTheme: (theme) => setPrefs((p) => ({ ...p, theme })),
      setAccent: (accent) => setPrefs((p) => ({ ...p, accent })),
      t,
    }),
    [prefs, t],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): Ctx {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}
