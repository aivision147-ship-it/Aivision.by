import { createFileRoute } from "@tanstack/react-router";
import { StudioPage } from "@/components/studio/page";
import type { TierId } from "@/data/catalog";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { tier?: TierId } => {
    const tier = search.tier;
    if (tier === "linen" || tier === "silk" || tier === "velvet") return { tier };
    return {};
  },
  head: () => ({
    meta: [
      { title: "Сайт-приглашение на свадьбу — AIVISION STUDIO" },
      {
        name: "description",
        content:
          "Гость открывает ссылку на телефоне: дата, место, дресс-код и ответ. Делаем по всей Беларуси. Страница под вашу свадьбу, не общий шаблон.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ru_BY" },
      { property: "og:url", content: "https://aivision.by/" },
      { property: "og:title", content: "Сайт-приглашение на свадьбу — электронное приглашение без приложения" },
      {
        property: "og:description",
        content:
          "Электронное приглашение на свадьбу: ссылка в Telegram, Viber и WhatsApp. Гость открывает её на телефоне без приложения. По всей Беларуси, от 0 BYN.",
      },
      { property: "og:image", content: "https://aivision.by/og.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://aivision.by/" }],
  }),
  component: Home,
});

function Home() {
  const { tier } = Route.useSearch();
  return <StudioPage initialTier={tier} />;
}
