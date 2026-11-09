"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Health = { status: string; time: string };

export default function ApiStatus() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Health>("/api/health/")
      .then(setHealth)
      .catch((err: Error) => setError(err.message));
  }, []);

  const state = error ? "error" : health ? "ok" : "loading";
  const styles = {
    loading: "border-slate-300 bg-white text-slate-600",
    ok: "border-emerald-300 bg-emerald-50 text-emerald-800",
    error: "border-rose-300 bg-rose-50 text-rose-800",
  }[state];

  return (
    <div className={`rounded-lg border p-4 text-sm ${styles}`}>
      {state === "loading" && "Checking Django API..."}
      {state === "ok" && <>Django API connected · server time {health!.time}</>}
      {state === "error" && (
        <>Could not reach the Django API ({error}). Is <code>python manage.py runserver</code> running?</>
      )}
    </div>
  );
}
