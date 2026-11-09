import { createFileRoute, Link } from "@tanstack/react-router";
import { DocPage, Block } from "@/components/studio/doc-page";

export const Route = createFileRoute("/tarify")({
  head: () => ({
    meta: [
      { title: "Тарифы — AIVISION STUDIO" },
      {
        name: "description",
        content: "Цены на сайт-приглашение: Economy 0, Middle 45, Premium 85, Luxury от 100 BYN. По всей Беларуси.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://aivision.by/tarify" }],
  }),
  component: TariffsPage,
});

const rows = [
  {
    name: "Economy",
    price: "0 BYN",
    pay: "Без оплаты",
    term: "Картинка у вас на телефоне, сайт не размещаем",
    href: "/economy",
    cta: "Собрать карточку",
  },
  {
    name: "Middle",
    price: "45 BYN",
    pay: "Вся сумма после сборки",
    term: "До дня свадьбы и ещё месяц",
    href: "/middle",
    cta: "Собрать сайт",
  },
  {
    name: "Premium",
    price: "85 BYN",
    pay: "Предоплата 42,50, остаток 42,50 после согласования",
    term: "6 месяцев с дня покупки",
    href: "/zakaz",
    search: { tier: "premium" as const },
    cta: "Оставить заявку",
  },
  {
    name: "Luxury",
    price: "от 100 BYN",
    pay: "Предоплата 50% согласованной суммы, остаток после приёмки",
    term: "12 месяцев с дня покупки",
    href: "/zakaz",
    search: { tier: "luxury" as const },
    cta: "Оставить заявку",
  },
];

function TariffsPage() {
  return (
    <DocPage kicker="Цены" title="Тарифы">
      <Block title="Четыре формата, те же цены, что на главной">
        <p>Цена в белорусских рублях и фиксируется в момент заявки. Доплаты за галерею, два языка и свой домен отдельно не берём: это уже входит в Premium и Luxury.</p>
      </Block>
      <div className="space-y-4">
        {rows.map((row) => (
          <article key={row.name} className="border border-line bg-cream p-5">
            <h2 className="font-serif text-3xl text-ink">{row.name}</h2>
            <p className="mt-2 font-serif text-2xl text-burgundy">{row.price}</p>
            <p className="mt-2">{row.pay}</p>
            <p className="mt-1">{row.term}</p>
            <Link to={row.href} search={"search" in row ? row.search : undefined} className="mt-4 inline-flex min-h-11 items-center text-sm text-ink underline">
              {row.cta}
            </Link>
          </article>
        ))}
      </div>
      <Block title="Срок работы">
        <p>Economy и Middle вы собираете сами. Premium и Luxury делаем мы: 3–10 дней с момента предоплаты 50%. Вторые 50% — когда вы откроете ссылку на своём телефоне и примете страницу.</p>
      </Block>
    </DocPage>
  );
}
