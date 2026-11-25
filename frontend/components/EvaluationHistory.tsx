"use client";

import { useState } from "react";
import type { Evaluation } from "@/lib/api";

type Props = {
  evaluations: Evaluation[];
  onDelete: (id: number) => void;
};

function winnerLabel(ev: Evaluation) {
  if (ev.winner === "A") return `${ev.model_a} won`;
  if (ev.winner === "B") return `${ev.model_b} won`;
  if (ev.winner === "tie") return "Tie";
  return "Undecided";
}

export default function EvaluationHistory({ evaluations, onDelete }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Recent evaluations</h2>
      {evaluations.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing saved yet. Save your first comparison above.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {evaluations.map((ev) => {
            const open = openId === ev.id;
            return (
              <li key={ev.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : ev.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium">{ev.prompt}</p>
                    <p className="text-xs text-slate-500">
                      {ev.model_a} ({ev.score_a ?? "–"}) vs {ev.model_b} ({ev.score_b ?? "–"}) ·{" "}
                      {winnerLabel(ev)} · {new Date(ev.created_at).toLocaleString()}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this evaluation?")) onDelete(ev.id);
                    }}
                    className="rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
                {open && (
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {[
                      [ev.model_a, ev.response_a],
                      [ev.model_b, ev.response_b],
                    ].map(([name, text], i) => (
                      <div key={i}>
                        <p className="mb-1 text-xs font-semibold text-slate-600">{name}</p>
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs">
                          {text || "(empty)"}
                        </pre>
                      </div>
                    ))}
                    {ev.notes && (
                      <p className="text-sm text-slate-600 md:col-span-2">
                        <span className="font-medium">Notes:</span> {ev.notes}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
