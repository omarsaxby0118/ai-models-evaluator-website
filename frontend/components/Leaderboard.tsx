"use client";

import type { LeaderboardRow } from "@/lib/api";

export default function Leaderboard({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Leaderboard</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No models yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2">#</th>
              <th className="py-2">Model</th>
              <th className="py-2 text-right">W / L / T</th>
              <th className="py-2 text-right">Win rate</th>
              <th className="py-2 text-right">Avg score</th>
              <th className="py-2 text-right">Evals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 tabular-nums">
            {rows.map((r, i) => (
              <tr key={r.model}>
                <td className="py-2 text-slate-400">{i + 1}</td>
                <td className="py-2 font-medium">{r.model}</td>
                <td className="py-2 text-right">
                  {r.wins} / {r.losses} / {r.ties}
                </td>
                <td className="py-2 text-right">
                  {r.win_rate === null ? "–" : `${Math.round(r.win_rate * 100)}%`}
                </td>
                <td className="py-2 text-right">{r.avg_score ?? "–"}</td>
                <td className="py-2 text-right text-slate-500">{r.evaluations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
