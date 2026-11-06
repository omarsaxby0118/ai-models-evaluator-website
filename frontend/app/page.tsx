import ApiStatus from "@/components/ApiStatus";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold tracking-tight">Project template</h1>
      <p className="text-slate-600">
        Django API + Next.js + Tailwind CSS. Edit{" "}
        <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">frontend/app/page.tsx</code>{" "}
        to get started.
      </p>
      <ApiStatus />
    </main>
  );
}
