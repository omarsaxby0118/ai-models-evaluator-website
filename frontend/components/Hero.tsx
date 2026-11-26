"use client";

import { SparkIcon } from "@/components/icons";
import { usePreferences } from "@/lib/preferences";

export default function Hero() {
  const { t } = usePreferences();
  return (
    <div className="flex flex-col items-start gap-3 pt-4">
      <span className="chip border border-brand-500/25 bg-brand-500/10 py-1 text-brand-700 dark:text-brand-300">
        <SparkIcon /> {t("app.badge")}
      </span>
      <h1 className="bg-gradient-to-r from-fg via-fg to-brand-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl dark:to-brand-400">
        {t("app.title")}
      </h1>
      <p className="max-w-2xl text-base text-muted">{t("app.tagline")}</p>
    </div>
  );
}
