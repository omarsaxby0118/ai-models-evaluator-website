"use client";

import { useState } from "react";

export const MODELS = ["Codex", "Claude"] as const;
export type ModelName = (typeof MODELS)[number];

type Props = {
  title: string;
  defaultModel?: ModelName;
};

export default function ModelCard({ title, defaultModel = "Codex" }: Props) {
  const [model, setModel] = useState<ModelName>(defaultModel);
  const [text, setText] = useState("");

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as ModelName)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Write something for ${model}...`}
        rows={10}
        className="w-full resize-y rounded-md border border-slate-300 p-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />
    </div>
  );
}
