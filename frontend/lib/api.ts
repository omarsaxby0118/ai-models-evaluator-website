export const API_URL =process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let fields: Record<string, string[]> = {};
    try {
      fields = await res.json();
    } catch {
      // non-JSON error body
    }
    const detail = Object.entries(fields)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
      .join("; ");
    throw new ApiError(detail || `${res.status} ${res.statusText}`, res.status, fields);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type AIModel = { id: number; name: string; provider: string };

export type Winner = "A" | "B" | "tie" | "";

export type EvaluationInput = {
  prompt: string;
  model_a: string;
  response_a: string;
  score_a: number | null;
  model_b: string;
  response_b: string;
  score_b: number | null;
  winner: Winner;
  notes: string;
};

export type Evaluation = EvaluationInput & { id: number; created_at: string };

export type LeaderboardRow = {
  model: string;
  wins: number;
  losses: number;
  ties: number;
  evaluations: number;
  win_rate: number | null;
  avg_score: number | null;
};

export const api = {
  models: () => apiFetch<AIModel[]>("/api/models/"),
  evaluations: (limit = 20) => apiFetch<Evaluation[]>(`/api/evaluations/?limit=${limit}`),
  createEvaluation: (data: EvaluationInput) =>
    apiFetch<Evaluation>("/api/evaluations/", { method: "POST", body: JSON.stringify(data) }),
  deleteEvaluation: (id: number) =>
    apiFetch<void>(`/api/evaluations/${id}/`, { method: "DELETE" }),
  leaderboard: () => apiFetch<LeaderboardRow[]>("/api/leaderboard/"),
  exportCsvUrl: `${API_URL}/api/evaluations/export/`,
};
