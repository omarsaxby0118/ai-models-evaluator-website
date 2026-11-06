import ApiStatus from "@/components/ApiStatus";
import ModelCard from "@/components/ModelCard";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">AI Models Evaluator</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ModelCard title="Model A" defaultModel="Codex" />
        <ModelCard title="Model B" defaultModel="Claude" />
      </div>

      <ApiStatus />
    </main>
  );
}
