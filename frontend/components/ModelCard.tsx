"use client";

export const FALLBACK_MODELS = ["Codex", "Claude"];

type Props = {
  title: string;
  models: string[];
  model: string;
  onModelChange: (model: string) => void;
  response: string;
  onResponseChange: (text: string) => void;
  score: number | null;
  onScoreChange: (score: number | null) => void;
  isWinner?: boolean;
};

const SCORES = Array.from({ length: 10 }, (_, i) => i + 1);

export default function ModelCard({
  title,
  models,
  model,
  onModelChange,
  response,
  onResponseChange,
  score,
  onScoreChange,
  isWinner = false,
}: Props) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm transition-colors ${
        isWinner ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {title}
          {isWinner && (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Winner
            </span>
          )}
        </h2>
        <select
          aria-label={`${title} model`}
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <textarea
        aria-label={`${title} response`}
        value={response}
        onChange={(e) => onResponseChange(e.target.value)}
        placeholder={`Paste ${model}'s response here...`}
        rows={10}
        className="w-full resize-y rounded-md border border-slate-300 p-3 font-mono text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {response.length} chars · {response.trim() ? response.trim().split(/\s+/).length : 0} words
        </span>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          Score
          <select
            value={score ?? ""}
            onChange={(e) => onScoreChange(e.target.value ? Number(e.target.value) : null)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="">–</option>
            {SCORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="text-slate-400">/ 10</span>
        </label>
      </div>
    </div>
  );
}
