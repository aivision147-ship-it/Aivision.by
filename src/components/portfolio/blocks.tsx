import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { styleTagLabel, type StyleTag } from "@/data/style-tags";
import type { PortfolioWork } from "@/data/portfolio";
import { wantHref } from "@/data/portfolio-match";
import { site } from "@/lib/site";

export function tierLabel(tier: PortfolioWork["tier"]) {
  return tier === "lux" ? "Люкс" : "Премиум";
}

export function priceLabel(work: Pick<PortfolioWork, "priceFrom">) {
  return `от ${work.priceFrom} BYN`;
}

export function Covers({ work }: { work: PortfolioWork }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] items-end gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
      <img src={work.coverPhone} alt={`Сайт «${work.title}» на телефоне`} className="aspect-[9/16] w-full rounded-2xl border border-line object-cover object-top" />
      <img src={work.coverLaptop} alt={`Сайт «${work.title}» на ноутбуке`} className="aspect-[16/10] w-full rounded-2xl border border-line object-cover object-top" />
    </div>
  );
}

export function ExampleMark() {
  return <span className="inline-flex min-h-7 items-center rounded-full bg-burgundy px-3 text-xs text-cream">Пример дизайна</span>;
}

export function WorkCard({ work }: { work: PortfolioWork }) {
  return (
    <article className="grid gap-5 border border-line bg-cream p-4 md:grid-cols-2 md:p-6">
      <Covers work={work} />
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs tracking-wide text-muted uppercase">
          {work.isExample ? <ExampleMark /> : null}
          <span>{tierLabel(work.tier)}</span>
          <span>{work.city}</span>
        </div>
        <h2 className="mt-2 font-serif text-4xl">
          <Link to="/portfolio/$slug" params={{ slug: work.slug }} className="hover:text-burgundy">{work.title}</Link>
        </h2>
        <p className="mt-2 text-sm text-ink-soft">{work.shortDescription}</p>
        <p className="mt-4 text-xs tracking-wide text-muted uppercase">Что вошло</p>
        <ul className="mt-2 space-y-1 text-sm">
          {work.done.slice(0, 6).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 font-serif text-2xl">{priceLabel(work)}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {work.liveUrl ? (
            <a href={work.liveUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center border border-line px-4 text-sm">Смотреть сайт</a>
          ) : null}
          <a href={wantHref(work)} className="inline-flex min-h-11 items-center justify-center bg-burgundy px-4 text-sm text-cream">Хочу так же</a>
        </div>
      </div>
    </article>
  );
}

export function CustomBanner() {
  return (
    <a href="/portfolio" className="flex min-h-16 items-center justify-center border border-burgundy bg-cream px-4 py-3 text-center text-sm text-burgundy">
      Хотите уникальный дизайн? Работы под ключ от 85 BYN
    </a>
  );
}

export function TemplateBanner() {
  return (
    <a href="/shablony" className="mt-10 flex min-h-16 items-center justify-center bg-burgundy px-4 py-4 text-center text-sm text-cream">
      Нужно быстрее и дешевле? Готовые шаблоны от 0 BYN
    </a>
  );
}

export function Gallery({ work }: { work: PortfolioWork }) {
  const [open, setOpen] = useState<number | null>(null);
  const current = open === null ? null : work.gallery[open];
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {work.gallery.map((src, index) => (
          <li key={src}>
            <button type="button" className="block w-full" onClick={() => setOpen(index)}>
              <img src={src} alt={`Кадр ${index + 1} сайта «${work.title}»`} className="aspect-[3/4] w-full border border-line object-cover object-top" />
            </button>
          </li>
        ))}
      </ul>
      {current ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4" role="dialog" aria-modal="true">
          <button type="button" className="absolute top-4 right-4 min-h-11 px-3 text-cream" onClick={() => setOpen(null)}>Закрыть</button>
          <button type="button" className="absolute top-1/2 left-3 min-h-11 px-3 text-cream" onClick={() => setOpen((open! + work.gallery.length - 1) % work.gallery.length)} aria-label="Предыдущий кадр">←</button>
          <img src={current} alt="" className="max-h-[85dvh] max-w-full object-contain" />
          <button type="button" className="absolute top-1/2 right-3 min-h-11 px-3 text-cream" onClick={() => setOpen((open! + 1) % work.gallery.length)} aria-label="Следующий кадр">→</button>
        </div>
      ) : null}
    </div>
  );
}

export function ShortBrief({ work }: { work: PortfolioWork }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !contact.trim() || !date) return;
    const raw = localStorage.getItem("aiv-briefs");
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    list.unshift({
      partner1: name.trim(),
      partner2: "заявка с портфолио",
      date,
      city: work.city,
      venue: "",
      tier: work.tier,
      style: work.styleTags[0],
      ref: work.slug,
      texts: "напишите за нас",
      note: comment.trim(),
      contact: contact.trim(),
      oferta: true,
      privacy: true,
      at: new Date().toISOString(),
    });
    localStorage.setItem("aiv-briefs", JSON.stringify(list.slice(0, 20)));
    setDone(true);
  }
  if (done) return <p className="mt-4 text-sm">Заявка записана в этом браузере, как и бриф на странице заказа. Письмо не отправлено: почта ещё не подключена.</p>;
  return (
    <form className="mt-4 grid max-w-xl gap-3" onSubmit={submit}>
      <label className="text-sm">Имя<input className="studio-input mt-1" value={name} onChange={(event) => setName(event.target.value)} required /></label>
      <label className="text-sm">Телефон или Telegram<input className="studio-input mt-1" value={contact} onChange={(event) => setContact(event.target.value)} required /></label>
      <label className="text-sm">Дата свадьбы<input className="studio-input mt-1" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
      <label className="text-sm">Комментарий<textarea className="studio-input mt-1 min-h-24" value={comment} onChange={(event) => setComment(event.target.value)} /></label>
      <button type="submit" className="min-h-12 bg-burgundy px-5 text-sm text-cream">Отправить</button>
    </form>
  );
}

export function workJsonLd(work: PortfolioWork) {
  const url = `${site.origin}/portfolio/${work.slug}`;
  const image = `${site.origin}${work.coverLaptop}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: work.title,
        description: work.shortDescription,
        image,
        url,
        creator: { "@type": "Organization", name: "AIVISION STUDIO", url: site.origin },
        offers: {
          "@type": "Offer",
          price: work.priceFrom,
          priceCurrency: "BYN",
          description: `от ${work.priceFrom} BYN`,
          url,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: `${site.origin}/` },
          { "@type": "ListItem", position: 2, name: "Работы под ключ", item: `${site.origin}/portfolio` },
          { "@type": "ListItem", position: 3, name: work.title, item: url },
        ],
      },
    ],
  };
}

export function portfolioJsonLd(works: PortfolioWork[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Свадебные сайты под ключ — работы студии AIVISION, Минск",
        url: `${site.origin}/portfolio`,
        isPartOf: { "@type": "WebSite", name: "AIVISION STUDIO", url: site.origin },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: works.map((work, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${site.origin}/portfolio/${work.slug}`,
            name: work.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: `${site.origin}/` },
          { "@type": "ListItem", position: 2, name: "Работы под ключ", item: `${site.origin}/portfolio` },
        ],
      },
    ],
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function tagName(tag: StyleTag) {
  return styleTagLabel[tag];
}
