import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { showcaseById } from "@/data/showcase";

export const Route = createFileRoute("/demo/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Демо ${params.id} — AIVISION STUDIO` },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const { id } = Route.useParams();
  const item = showcaseById(id);
  const navigate = useNavigate();
  const [width, setWidth] = useState<"390px" | "768px" | "100%">("390px");
  if (!item) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-6">
        <h1 className="font-serif text-5xl">Такого образца нет</h1>
        <Link to="/shablony" className="text-burgundy underline">К шаблонам</Link>
      </main>
    );
  }
  const design = item;
  function start() {
    sessionStorage.setItem("aiv-pick-template", design.id);
    void navigate({ to: "/middle" });
  }
  return (
    <div className="flex min-h-dvh flex-col bg-ink">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-cream">
        <Link to="/shablony" className="min-h-10 rounded-full border border-white/30 px-4 text-sm leading-10">К шаблонам</Link>
        <div className="flex gap-1">
          {([["390px", "Телефон"], ["768px", "Планшет"], ["100%", "Компьютер"]] as const).map(([value, label]) => (
            <button key={value} type="button" className={width === value ? "min-h-10 rounded-full bg-cream px-3 text-sm text-ink" : "min-h-10 rounded-full border border-white/30 px-3 text-sm"} onClick={() => setWidth(value)}>{label}</button>
          ))}
        </div>
        <p className="text-sm">{item.name}</p>
      </div>
      <div className="flex min-h-0 flex-1 justify-center pb-20">
        <iframe title={item.name} src={item.file} className="h-[calc(100dvh-7.5rem)] border-0 bg-white" style={{ width }} sandbox="allow-scripts allow-popups allow-forms" />
      </div>
      <button type="button" className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-10 min-h-11 -translate-x-1/2 rounded-full bg-burgundy px-5 text-sm text-cream shadow-md" onClick={start}>
        Сделать такое же
      </button>
    </div>
  );
}
