import { createFileRoute, Link } from "@tanstack/react-router";
import { site, whatsappHref } from "@/lib/site";
import { SiteFooter } from "@/components/studio/site-footer";

export const Route = createFileRoute("/o-nas")({
  head: () => ({
    meta: [
      { title: "О нас — AIVISION STUDIO" },
      {
        name: "description",
        content:
          "AIVISION STUDIO делает свадебные сайты-приглашения по всей Беларуси: программа, подарки и ответы гостей в одной ссылке.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:url", content: "https://aivision.by/o-nas" },
      { property: "og:title", content: "О нас — AIVISION STUDIO" },
    ],
    links: [{ rel: "canonical", href: "https://aivision.by/o-nas" }],
  }),
  component: AboutPage,
});

const points = [
  {
    title: "Всё в одном месте",
    text: "Локация, программа дня, пожелания по подаркам и дресс-код легко найти за пару кликов.",
  },
  {
    title: "Мгновенная связь",
    text: "Форма ответов отправляет подтверждения от гостей прямо вам в удобный мессенджер или таблицу.",
  },
  {
    title: "Экономия времени и бюджета",
    text: "Никакой печати, долгих доставок и лишних нервов — ссылка на сайт отправляется за секунду.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
          <Link to="/" className="font-serif text-lg tracking-wide wordmark">
            AiVISION STUDIO
          </Link>
          <Link to="/" className="text-sm text-muted">
            На главную
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-5 py-16">
        <p className="text-xs tracking-label text-burgundy uppercase">О нас</p>
        <h1 className="mt-4 font-serif text-5xl">
          Цифровые свадебные приглашения, которые запоминаются
        </h1>
        <p className="mt-6 text-lg text-ink-soft">
          Мы делаем свадебную полиграфию современной, экологичной и безупречно удобной. Работаем по всей
          Беларуси: ссылка уходит гостям в любой город, приезжать в студию не нужно. Наша команда
          объединяет стильный веб-дизайн и продуманную функциональность, чтобы ваше приглашение стало
          ярким продолжением концепции праздника.
        </p>
        <h2 className="mt-12 font-serif text-4xl">Что получает ваша пара</h2>
        <ul className="mt-6 space-y-4">
          {points.map((point) => (
            <li key={point.title} className="rounded-2xl border border-line bg-cream p-5">
              <h3 className="font-serif text-2xl">{point.title}</h3>
              <p className="mt-2 text-sm text-muted">{point.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 font-serif text-3xl">
          Мы создаём не просто сайты, а предвкушение вашего идеального дня.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/" hash="samples" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-burgundy px-5 text-sm text-cream">
            Смотреть образцы
          </Link>
          <a href={whatsappHref()} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-burgundy px-5 text-sm text-burgundy">
            WhatsApp {site.whatsappDisplay}
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
