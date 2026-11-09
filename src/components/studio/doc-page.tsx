import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/studio/site-footer";
import { company } from "@/lib/site";

export function DocPage({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
          <Link to="/" className="font-serif text-lg tracking-wide wordmark">
            AiVISION STUDIO
          </Link>
          <Link to="/tarify" className="text-sm text-muted">
            Тарифы
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-5 py-12">
        <p className="text-xs tracking-label text-burgundy uppercase">{kicker}</p>
        <h1 className="mt-3 font-serif text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">
          Редакция {company.edition} от {company.editionDate}
        </p>
        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-soft">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-3xl text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
