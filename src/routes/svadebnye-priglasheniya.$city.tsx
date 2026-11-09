import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FlowShell } from "@/components/flow/shell";
import { cityBySlug, type CityPage } from "@/data/cities";
import { site } from "@/lib/site";

export const Route = createFileRoute("/svadebnye-priglasheniya/$city")({
  loader: ({ params }) => {
    const city = cityBySlug(params.city);
    if (!city) throw notFound();
    return city;
  },
  head: ({ params }) => {
    const city = cityBySlug(params.city);
    if (!city) {
      return {
        meta: [
          { title: "Страница не найдена — AIVISION" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }
    return {
      meta: [
        { title: city.title },
        { name: "description", content: city.description },
        { name: "robots", content: "index, follow" },
      ],
      links: [{ rel: "canonical", href: city.canonical }],
    };
  },
  notFoundComponent: CityMissing,
  component: CityLanding,
});

function CityMissing() {
  return (
    <FlowShell>
      <h1 className="font-serif text-5xl">Такого города нет</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">Страницы пока есть для Минска и Гомеля. Остальные города обслуживаем так же, онлайн.</p>
      <Link to="/" className="mt-6 inline-flex min-h-11 items-center text-burgundy underline">На главную</Link>
    </FlowShell>
  );
}

function CityLanding() {
  const city = Route.useLoaderData();
  const venues = city.venues.filter((venue) => venue.name.trim());
  return (
    <FlowShell>
      <JsonLd data={serviceJsonLd(city)} />
      <JsonLd data={faqJsonLd(city)} />
      <JsonLd data={breadcrumbJsonLd(city)} />
      <nav className="text-sm text-muted" aria-label="Хлебные крошки">
        <Link to="/" className="underline">Главная</Link>
        <span> → </span>
        <Link to="/katalog" className="underline">Свадебные приглашения</Link>
        <span> → </span>
        <span className="text-ink">{city.name}</span>
      </nav>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl">{city.h1}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed">{city.text}</p>
      <p className="mt-6">
        <Link to="/katalog" className="inline-flex min-h-11 items-center bg-burgundy px-4 text-sm text-cream">Каталог шаблонов</Link>
      </p>
      {venues.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-serif text-3xl">Площадки</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {venues.map((venue) => (
              <li key={venue.name}>
                {venue.sourceUrl ? <a className="underline" href={venue.sourceUrl}>{venue.name}</a> : venue.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="mt-12 max-w-3xl">
        <h2 className="font-serif text-3xl">Вопросы</h2>
        <div className="mt-4 space-y-5">
          {city.faq.map((item) => (
            <article key={item.q}>
              <h3 className="font-serif text-2xl">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mt-12">
        <h2 className="font-serif text-3xl">Другие города</h2>
        <p className="mt-3 text-sm">
          {city.neighbors.map((item, index) => {
            const page = item.slug ? cityBySlug(item.slug) : null;
            return (
              <span key={item.name}>
                {index > 0 ? ", " : null}
                {page ? (
                  <Link to="/svadebnye-priglasheniya/$city" params={{ city: page.slug }} className="text-burgundy underline">{item.name}</Link>
                ) : (
                  item.name
                )}
              </span>
            );
          })}
        </p>
      </section>
    </FlowShell>
  );
}

function serviceJsonLd(city: CityPage) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Сайт-приглашение на свадьбу в ${city.inCity}`,
    serviceType: "Электронные приглашения на свадьбу",
    url: city.canonical,
    provider: {
      "@type": "ProfessionalService",
      name: "AIVISION STUDIO",
      url: "https://aivision.by/",
      telephone: site.phone,
      email: site.email,
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "Country", name: "Беларусь" },
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BYN",
      lowPrice: "0",
      highPrice: "100",
    },
  };
}

function faqJsonLd(city: CityPage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: city.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function breadcrumbJsonLd(city: CityPage) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${site.origin}/` },
      { "@type": "ListItem", position: 2, name: "Свадебные приглашения", item: `${site.origin}/katalog` },
      { "@type": "ListItem", position: 3, name: city.name, item: city.canonical },
    ],
  };
}

function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
