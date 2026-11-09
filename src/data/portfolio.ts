import type { StyleTag } from "@/data/style-tags";

export type PortfolioTier = "premium" | "lux";

export type PortfolioWork = {
  slug: string;
  title: string;
  couple: string;
  city: string;
  tier: PortfolioTier;
  priceFrom: 85 | 100;
  currency: "BYN";
  styleTags: StyleTag[];
  shortDescription: string;
  task: string;
  done: string[];
  coverPhone: string;
  coverLaptop: string;
  gallery: string[];
  liveUrl: string;
  duration: string;
  review?: { text: string; names: string };
  isExample: boolean;
};

const shot = (name: string) =>
  [1, 2, 3, 4].map((index) => `/portfolio/placeholders/${name}-${index}.svg`);

export const portfolio: PortfolioWork[] = [
  {
    slug: "more",
    title: "Море",
    couple: "Нина и Глеб",
    city: "Мядельский район",
    tier: "lux",
    priceFrom: 100,
    currency: "BYN",
    styleTags: ["sea"],
    shortDescription:
      "Свадьба на три дня у моря: гости сразу видят, как добраться, где ночевать и в какой день приехать.",
    task: "Пара живёт у моря и не хотела уезжать в банкетный зал. Нужен был один сайт на уикенд, чтобы гости поняли дорогу, отель и расписание без длинных переписок.",
    done: [
      "Сайт на три дня: пятница, суббота и завтрак",
      "Дорога, отель и трансфер",
      "Два дресс-кода",
      "Анкета с датой приезда",
      "Маршрут и программа вечера",
    ],
    coverPhone: "/portfolio/more/phone.png",
    coverLaptop: "/portfolio/more/laptop.png",
    gallery: [1, 2, 3, 4, 5, 6].map((index) => `/portfolio/more/gallery-${index}.png`),
    liveUrl: "/portfolio/more-live/index.html",
    duration: "16–20 дней",
    isExample: false,
  },
  {
    slug: "vecher",
    title: "Вечер",
    couple: "Имена пары",
    city: "Минск",
    tier: "premium",
    priceFrom: 85,
    currency: "BYN",
    styleTags: ["dark-evening"],
    shortDescription: "Так может выглядеть тёмный вечерний сайт. Это не выполненный заказ, а пример устройства страницы.",
    task: "Показать карточку и страницу работы в тёмном вечернем стиле, пока такого заказа в портфолио нет.",
    done: ["Тёмный фон и короткий текст", "Имена, дата и место", "Программа вечера", "Анкета гостя"],
    coverPhone: "/portfolio/placeholders/vecher-phone.svg",
    coverLaptop: "/portfolio/placeholders/vecher-laptop.svg",
    gallery: shot("vecher"),
    liveUrl: "",
    duration: "3–10 дней",
    isExample: true,
  },
  {
    slug: "polotno",
    title: "Полотно",
    couple: "Имена пары",
    city: "Минск",
    tier: "lux",
    priceFrom: 100,
    currency: "BYN",
    styleTags: ["belarusian"],
    shortDescription: "Пример белорусского индивидуального сайта: орнамент, спокойный ритм, без чужого заказа.",
    task: "Показать, как выглядит страница работы в белорусском стиле, пока реальной пары в этом разделе нет.",
    done: ["Орнамент и полотно", "Имена крупно", "Место и сбор гостей", "Тексты на русском или белорусском"],
    coverPhone: "/portfolio/placeholders/polotno-phone.svg",
    coverLaptop: "/portfolio/placeholders/polotno-laptop.svg",
    gallery: shot("polotno"),
    liveUrl: "",
    duration: "3–10 дней",
    isExample: true,
  },
  {
    slug: "zal",
    title: "Зал",
    couple: "Имена пары",
    city: "Минск",
    tier: "lux",
    priceFrom: 100,
    currency: "BYN",
    styleTags: ["classic"],
    shortDescription: "Пример классического сайта под ключ. Плашка на карточке прямо говорит, что это образец дизайна.",
    task: "Держать в витрине классический пример, не выдавая его за свадьбу, которую студия уже сдала.",
    done: ["Светлый классический макет", "Дата и место", "Программа", "Ответ гостя"],
    coverPhone: "/portfolio/placeholders/zal-phone.svg",
    coverLaptop: "/portfolio/placeholders/zal-laptop.svg",
    gallery: shot("zal"),
    liveUrl: "",
    duration: "3–10 дней",
    isExample: true,
  },
];

export function portfolioBySlug(slug: string) {
  return portfolio.find((item) => item.slug === slug) ?? null;
}

export function publicPortfolio() {
  return portfolio.filter((item) => !item.isExample);
}
