"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  GlobeIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  SparkIcon,
  SunIcon,
} from "@/components/icons";
import { LANGUAGES, type Lang } from "@/lib/i18n";
import { ACCENTS, usePreferences, type ThemeMode } from "@/lib/preferences";

function LanguageSelect() {
  const { lang, setLang, t } = usePreferences();
  return (
    <label className="relative flex items-center">
      <span className="sr-only">{t("nav.language")}</span>
      <GlobeIcon className="pointer-events-none absolute left-3 text-muted" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="h-9 appearance-none rounded-full border border-line bg-surface pl-9 pr-8 text-sm font-medium text-fg transition hover:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 text-muted" />
    </label>
  );
}

const MODE_ICONS: Record<ThemeMode, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

function ThemeMenu() {
  const { theme, setTheme, accent, setAccent, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const CurrentIcon = MODE_ICONS[theme];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-medium text-fg transition hover:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
      >
        <CurrentIcon className="text-brand-500" />
        <span className="hidden sm:inline">{t("nav.theme")}</span>
        <span className="h-3 w-3 rounded-full bg-brand-500 ring-2 ring-brand-500/25" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("nav.theme")}
          className="card absolute right-0 z-30 mt-2 w-72 p-4 shadow-xl shadow-slate-900/10"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t("theme.mode")}</p>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1">
            {(Object.keys(MODE_ICONS) as ThemeMode[]).map((mode) => {
              const ModeIcon = MODE_ICONS[mode];
              const active = theme === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition ${
                    active ? "bg-surface text-brand-600 shadow-sm dark:text-brand-300" : "text-muted hover:text-fg"
                  }`}
                >
                  <ModeIcon className="text-base" />
                  {t(`theme.${mode}`)}
                </button>
              );
            })}
          </div>

          <p className="mb-2 mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <PaletteIcon /> {t("theme.accent")}
          </p>
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccent(a.id)}
                aria-label={a.id}
                aria-pressed={accent === a.id}
                title={a.id}
                style={{ backgroundColor: a.swatch }}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:scale-110 ${
                  accent === a.id ? "ring-2 ring-fg/40 ring-offset-2 ring-offset-surface" : ""
                }`}
              >
                {accent === a.id && <CheckIcon />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { t } = usePreferences();
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-page/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-lg text-white shadow-lg shadow-brand-500/30">
            <SparkIcon />
          </div>
          <span className="font-semibold tracking-tight">{t("app.title")}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelect />
          <ThemeMenu />
        </div>
      </div>
    </header>
  );
}
