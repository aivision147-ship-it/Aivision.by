import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/studio/site-footer";

export function FlowShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-2">
          <Link to="/" className="wordmark font-serif text-lg tracking-wide">AiVISION STUDIO</Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm text-muted">
            <Link to="/shablony" className="hover:text-ink">Шаблоны</Link>
            <Link to="/portfolio" className="hover:text-ink">Работы под ключ</Link>
            <Link to="/kabinet" className="hover:text-ink">Кабинет</Link>
            <Link to="/" className="hover:text-ink">На главную</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
