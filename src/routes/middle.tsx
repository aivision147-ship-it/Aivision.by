import { createFileRoute, Link } from "@tanstack/react-router";
import { MiddleBuilder } from "@/components/middle/builder";
import { SiteFooter } from "@/components/studio/site-footer";

export const Route = createFileRoute("/middle")({
  head: () => ({
    meta: [
      { title: "Собрать сайт — Middle — AIVISION STUDIO" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "stylesheet", href: "/fonts/faces.css" }],
  }),
  component: MiddlePage,
});

function MiddlePage() {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link to="/" className="wordmark font-serif text-lg tracking-wide">AiVISION STUDIO</Link>
          <nav className="flex items-center gap-4 text-sm text-muted">
            <Link to="/shablony" className="hover:text-ink">Шаблоны</Link>
            <Link to="/kabinet" className="hover:text-ink">Кабинет</Link>
            <Link to="/" className="hover:text-ink">На главную</Link>
          </nav>
        </div>
      </header>
      <MiddleBuilder />
      <SiteFooter />
    </div>
  );
}
