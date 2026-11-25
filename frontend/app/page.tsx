import ApiStatus from "@/components/ApiStatus";
import Evaluator from "@/components/Evaluator";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Models Evaluator</h1>
        <p className="mt-1 text-sm text-slate-600">
          Give two models the same prompt, paste their responses, score them, and track who wins.
        </p>
      </div>

      <Evaluator />

      <ApiStatus />
    </main>
  );
}
