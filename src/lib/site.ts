export const site = {
  origin: "https://aivision.by",
  email: "aivision147@gmail.com",
  phone: "+375447149650",
  phoneDisplay: "+375 44 714-96-50",
  whatsapp: "375447149650",
  whatsappDisplay: "+375 44 714-96-50",
  viber: "viber://chat?number=%2B375447149650",
  telegram: "https://t.me/+375447149650",
};

/** false — счёт выставляет менеджер. true — вернуть оплату через bePaid. */
export const paymentsEnabled: boolean = false;

export const pages = [
  { href: "/", title: "Главная" },
  { href: "/o-nas", title: "О нас" },
  { href: "/#services", title: "Услуги" },
  { href: "/shablony", title: "Шаблоны" },
  { href: "/portfolio", title: "Работы под ключ" },
  { href: "/#process", title: "Как идёт работа" },
  { href: "/#faq", title: "Вопросы" },
  { href: "/#order", title: "Заявка" },
];

export const company = {
  name: "ЧТУП «Инполи»",
  unp: "291630474",
  edition: "1.0",
  editionDate: "27 октября 2026",
};

export const legalLinks = [
  { href: "/tarify", title: "Тарифы" },
  { href: "/oplata", title: "Оплата" },
  { href: "/kontakty", title: "Контакты" },
  { href: "/oferta", title: "Публичная оферта" },
  { href: "/vozvrat", title: "Условия возврата" },
  { href: "/privacy", title: "Политика персональных данных" },
  { href: "/shrift", title: "Шрифты и лицензии" },
] as const;

export function pageUrl(href: string) {
  if (href.startsWith("/#")) return `${site.origin}/${href.slice(1)}`;
  if (href === "/") return `${site.origin}/`;
  return `${site.origin}${href}`;
}

export function whatsappHref(text?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function mailtoHref(subject: string, body: string) {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
