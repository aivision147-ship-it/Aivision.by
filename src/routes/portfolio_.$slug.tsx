import { createFileRoute, Link } from "@tanstack/react-router";
import { FlowShell } from "@/components/flow/shell";
import {
  Covers,
  ExampleMark,
  Gallery,
  JsonLd,
  ShortBrief,
  WorkCard,
  priceLabel,
  tagName,
  tierLabel,
  workJsonLd,
} from "@/components/portfolio/blocks";
import { portfolioBySlug } from "@/data/portfolio";
import { relatedWorks, templatesForWork, wantHref } from "@/data/portfolio-match";
import { site } from "@/lib/site";

export const Route = createFileRoute("/portfolio_/$slug")({
  head: ({ params }) => {
    const work = portfolioBySlug(params.slug);
    if (!work) {
      return { meta: [{ title: "Работа не найдена — AIVISION STUDIO" }, { name: "robots", content: "noindex, follow" }] };
    }
    return {
      meta: [
        { title: `${work.title} — свадебный сайт под ключ — AIVISION` },
        { name: "description", content: work.shortDescription },
        { name: "robots", content: work.isExample ? "noindex, follow" : "index, follow" },
      ],
      links: [{ rel: "canonical", href: `${site.origin}/portfolio/${work.slug}` }],
    };
  },
  component: WorkPage,
});

function WorkPage() {
  const { slug } = Route.useParams();
  const work = portfolioBySlug(slug);
  if (!work) {
    return (
      <FlowShell>
        <h1 className="font-serif text-5xl">Такой работы нет</h1>
        <Link to="/portfolio" className="mt-4 inline-flex min-h-11 items-center text-burgundy underline">Все работы</Link>
      </FlowShell>
    );
  }
  const related = relatedWorks(work);
  const templates = templatesForWork(work.styleTags, 3);
  return (
    <FlowShell>
      <JsonLd data={workJsonLd(work)} />
      <section className="grid gap-6 md:grid-cols-2 md:items-center">
        <Covers work={work} />
        <div>
          {work.isExample ? <ExampleMark /> : null}
          <p className="mt-3 text-xs tracking-wide text-muted uppercase">{tierLabel(work.tier)} · {work.city} · {work.styleTags.map(tagName).join(", ")}</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{work.title} — свадебный сайт под ключ</h1>
          <p className="mt-3 text-sm text-muted">{work.couple}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {work.liveUrl ? (
              <a href={work.liveUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center border border-line px-4 text-sm">Смотреть сайт</a>
            ) : null}
            <a href={wantHref(work)} className="inline-flex min-h-11 items-center justify-center bg-burgundy px-4 text-sm text-cream">Хочу так же</a>
          </div>
        </div>
      </section>
      <section className="mt-12 max-w-2xl">
        <h2 className="font-serif text-3xl">Задача пары</h2>
        <p className="mt-3 text-sm leading-relaxed">{work.task}</p>
      </section>
      <section className="mt-10 max-w-2xl">
        <h2 className="font-serif text-3xl">Что сделали</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {work.done.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">Галерея</h2>
        <div className="mt-4"><Gallery work={work} /></div>
      </section>
      <section className="mt-10 max-w-xl border border-line p-5">
        <h2 className="font-serif text-3xl">Сроки и тариф</h2>
        <p className="mt-3 text-sm">{tierLabel(work.tier)}</p>
        <p className="mt-1 text-sm">Срок: {work.duration}</p>
        <p className="mt-1 font-serif text-2xl">{priceLabel(work)}</p>
      </section>
      {work.review ? (
        <section className="mt-10 max-w-2xl">
          <h2 className="font-serif text-3xl">Отзыв пары</h2>
          <blockquote className="mt-3 text-sm leading-relaxed">«{work.review.text}»</blockquote>
          <p className="mt-2 text-sm text-muted">{work.review.names}</p>
        </section>
      ) : null}
      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-serif text-3xl">Похожие работы</h2>
          <div className="mt-4 grid gap-6">{related.map((item) => <WorkCard key={item.slug} work={item} />)}</div>
        </section>
      ) : null}
      <section className="mt-12">
        <h2 className="font-serif text-3xl">Похожие шаблоны</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {templates.map((item) => (
            <li key={item.id} className="border border-line p-3">
              <img src={item.thumb} alt="" className="aspect-[3/4] w-full object-cover object-top" />
              <p className="mt-2 text-xs text-muted">{item.code}</p>
              <h3 className="font-serif text-2xl">{item.name}</h3>
              <p className="text-sm">0 или 45 BYN</p>
              <p className="text-xs text-muted">бюджетный вариант</p>
              <Link to="/shablony/$id" params={{ id: item.id }} className="mt-2 inline-flex min-h-10 items-center text-sm text-burgundy underline">Открыть шаблон</Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-12">
        <a href={wantHref(work)} className="inline-flex min-h-12 items-center bg-burgundy px-5 text-sm text-cream">Хочу так же</a>
        <h2 className="mt-6 font-serif text-3xl">Короткий бриф</h2>
        <ShortBrief work={work} />
      </section>
    </FlowShell>
  );
}
