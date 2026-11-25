"use client";

import { useCallback, useEffect, useState } from "react";
import EvaluationHistory from "@/components/EvaluationHistory";
import Leaderboard from "@/components/Leaderboard";
import ModelCard, { FALLBACK_MODELS } from "@/components/ModelCard";
import { api, type Evaluation, type EvaluationInput, type LeaderboardRow, type Winner } from "@/lib/api";

const emptyForm = (models: string[]): EvaluationInput => ({
  prompt: "",
  model_a: models[0] ?? "",
  response_a: "",
  score_a: null,
  model_b: models[1] ?? models[0] ?? "",
  response_b: "",
  score_b: null,
  winner: "",
  notes: "",
});

export default function Evaluator() {
  const [models, setModels] = useState<string[]>(FALLBACK_MODELS);
  const [form, setForm] = useState<EvaluationInput>(() => emptyForm(FALLBACK_MODELS));
  const [history, setHistory] = useState<Evaluation[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const [h, l] = await Promise.all([api.evaluations(), api.leaderboard()]);
    setHistory(h);
    setLeaderboard(l);
  }, []);

  useEffect(() => {
    api
      .models()
      .then((list) => {
        const names = list.map((m) => m.name);
        if (names.length) {
          setModels(names);
          setForm((f) => ({
            ...f,
            model_a: names.includes(f.model_a) ? f.model_a : names[0],
            model_b: names.includes(f.model_b) ? f.model_b : (names[1] ?? names[0]),
          }));
        }
      })
      .catch(() => {});
    refresh().catch(() => {});
  }, [refresh]);

  const set = <K extends keyof EvaluationInput>(key: K, value: EvaluationInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const swap = () =>
    setForm((f) => ({
      ...f,
      model_a: f.model_b,
      response_a: f.response_b,
      score_a: f.score_b,
      model_b: f.model_a,
      response_b: f.response_a,
      score_b: f.score_a,
      winner: f.winner === "A" ? "B" : f.winner === "B" ? "A" : f.winner,
    }));

  const sameModel = form.model_a === form.model_b;
  const canSave = form.prompt.trim() !== "" && !sameModel && !saving;

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.createEvaluation(form);
      setForm((f) => ({ ...emptyForm(models), model_a: f.model_a, model_b: f.model_b }));
      setMessage({ kind: "ok", text: "Evaluation saved." });
      await refresh();
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await api.deleteEvaluation(id);
      await refresh();
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
  };

  const winnerOptions: { value: Winner; label: string }[] = [
    { value: "A", label: `${form.model_a} (A)` },
    { value: "tie", label: "Tie" },
    { value: "B", label: `${form.model_b} (B)` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <label htmlFor="prompt" className="text-sm font-medium text-slate-700">
          Prompt
        </label>
        <textarea
          id="prompt"
          value={form.prompt}
          onChange={(e) => set("prompt", e.target.value)}
          placeholder="The task or question you gave both models..."
          rows={3}
          className="w-full resize-y rounded-md border border-slate-300 bg-white p-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ModelCard
          title="Model A"
          models={models}
          model={form.model_a}
          onModelChange={(v) => set("model_a", v)}
          response={form.response_a}
          onResponseChange={(v) => set("response_a", v)}
          score={form.score_a}
          onScoreChange={(v) => set("score_a", v)}
          isWinner={form.winner === "A"}
        />
        <ModelCard
          title="Model B"
          models={models}
          model={form.model_b}
          onModelChange={(v) => set("model_b", v)}
          response={form.response_b}
          onResponseChange={(v) => set("response_b", v)}
          score={form.score_b}
          onScoreChange={(v) => set("score_b", v)}
          isWinner={form.winner === "B"}
        />
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Which is better?</span>
          {winnerOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => set("winner", form.winner === o.value ? "" : o.value)}
              className={`rounded-full border px-3 py-1 text-sm ${
                form.winner === o.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {o.label}
            </button>
          ))}
          <button
            type="button"
            onClick={swap}
            className="ml-auto rounded-md px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            ⇄ Swap A / B
          </button>
        </div>
        <textarea
          aria-label="Notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Notes (optional): why one response was better, bugs spotted..."
          rows={2}
          className="w-full resize-y rounded-md border border-slate-300 p-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save evaluation"}
          </button>
          {sameModel && <span className="text-sm text-amber-700">Pick two different models.</span>}
          {message && (
            <span className={`text-sm ${message.kind === "ok" ? "text-emerald-700" : "text-rose-700"}`}>
              {message.text}
            </span>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Leaderboard rows={leaderboard} />
        </div>
        <div className="lg:col-span-3">
          <EvaluationHistory evaluations={history} onDelete={remove} />
        </div>
      </div>
    </div>
  );
}
