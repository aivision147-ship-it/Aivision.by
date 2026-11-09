import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ManagerPay } from "@/components/studio/manager-pay";
import { MarketingConsent } from "@/components/studio/marketing-consent";
import { DemoReminder, useDemoCoupleReminder } from "@/components/middle/demo-reminder";
import { SiteFooter } from "@/components/studio/site-footer";
import { postStudioOrder } from "@/lib/order-client";
import { company, mailtoHref, paymentsEnabled, site, whatsappHref } from "@/lib/site";

const payTier = {
  economy: "Эконом",
  middle: "Мидл",
  premium: "Премиум",
  luxury: "Люкс",
} as const;

export const Route = createFileRoute("/zakaz")({
  validateSearch: (search: Record<string, unknown>) => {
    const result: { tier?: "economy" | "middle" | "premium" | "luxury"; template?: string } = {};
    const tier = search.tier;
    if (tier === "premium" || tier === "luxury" || tier === "economy" || tier === "middle") result.tier = tier;
    if (typeof search.template === "string" && search.template.trim()) result.template = search.template.trim();
    return result;
  },
  head: () => ({
    meta: [
      { title: "Оформление заказа — AIVISION STUDIO" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: CheckoutPage,
});

const tiers = {
  economy: {
    name: "Economy",
    lines: ["Карточка-картинка", "0 BYN"],
    total: "Оплата не нужна",
    note: "Этот тариф скачивается картинкой. Счёта нет.",
  },
  middle: {
    name: "Middle",
    lines: ["Сайт по готовому образцу — 45 BYN"],
    total: "45 BYN",
    note: "После оплаты сайт публикуется на поддомене и работает до дня свадьбы и ещё месяц. Сейчас счёт ещё не выставляется.",
  },
  premium: {
    name: "Premium",
    lines: ["Тариф — 85 BYN", "Предоплата 50% — 42,50 BYN", "Остаток после согласования — 42,50 BYN"],
    total: "К заявке: 42,50 BYN",
    note: "Страницу собираем мы, 3–10 дней от предоплаты. Сама не публикуется. Ссылка работает 6 месяцев с дня покупки.",
  },
  luxury: {
    name: "Luxury",
    lines: ["Тариф — от 100 BYN, сумма по сложности", "Предоплата 50% согласованной суммы", "Остаток после приёмки страницы на вашем телефоне"],
    total: "Сумму подтвердим до счёта",
    note: "Индивидуальная страница, 3–10 дней от предоплаты. Ссылка работает 12 месяцев с дня покупки.",
  },
} as const;

function CheckoutPage() {
  const search = Route.useSearch();
  const tier = search.tier ?? "middle";
  const template = search.template ?? "";
  const offer = tiers[tier];
  const showDemoReminder = useDemoCoupleReminder();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [offerOk, setOfferOk] = useState(false);
  const [pdOk, setPdOk] = useState(false);
  const [portfolio, setPortfolio] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [sent, setSent] = useState("");
  const ready = tier !== "economy" && name.trim().length > 1 && contact.trim().length > 3 && email.includes("@") && offerOk && pdOk;
  const missing = [
    name.trim().length > 1 ? "" : "имя",
    contact.trim().length > 3 ? "" : "телефон или Telegram",
    email.includes("@") ? "" : "почту",
    offerOk ? "" : "оферту",
    pdOk ? "" : "согласие на данные",
  ].filter(Boolean);

  function submit() {
    const id = `AV-${Date.now().toString().slice(-8)}`;
    const record = {
      id,
      tier,
      template,
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      portfolio,
      marketing,
      total: offer.total,
      consents: [
        { type: "offer", version: company.edition, at: new Date().toISOString() },
        { type: "pd", version: company.edition, at: new Date().toISOString() },
        { type: "portfolio", version: company.edition, given: portfolio, at: new Date().toISOString() },
        { type: "marketing", version: "2026-11-09", given: marketing, at: new Date().toISOString() },
      ],
      userAgent: navigator.userAgent,
      status: paymentsEnabled ? "awaiting_payment_setup" : "awaiting_manager_invoice",
    };
    const previous = JSON.parse(localStorage.getItem("aivision-orders") || "[]");
    localStorage.setItem("aivision-orders", JSON.stringify([record, ...previous]));
    const parts = name.trim().split(/\s+и\s+/i);
    postStudioOrder({
      source: "zakaz",
      partner1: parts[0] ?? name.trim(),
      partner2: parts[1] ?? "",
      email: email.trim(),
      phone: contact.trim(),
      tier,
      note: template,
      marketing,
    });
    setSent(id);
  }

  const letter = sent
    ? `Заявка ${sent}. Тариф ${offer.name}.${template ? ` Шаблон ${template}.` : ""} ${offer.total}. ${name}, ${contact}, ${email}. Портфолио: ${portfolio ? "да" : "нет"}.`
    : "";
  const manager = tier !== "economy" ? <ManagerPay tier={payTier[tier]} template={template || undefined} orderId={sent || undefined} /> : null;

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
        <p className="text-xs tracking-label text-burgundy uppercase">Заказ</p>
        <h1 className="mt-3 font-serif text-5xl">Оформление</h1>
        {showDemoReminder ? <div className="mt-6"><DemoReminder /></div> : null}
        <article className="mt-8 border border-line bg-cream p-5">
          <h2 className="font-serif text-3xl">{offer.name}</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {offer.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-4 font-serif text-2xl">{offer.total}</p>
          <p className="mt-2 text-sm text-muted">{!paymentsEnabled && tier !== "economy" ? "Счёт выставляет менеджер. Деньги на сайте не списываются." : offer.note}</p>
        </article>
        {tier !== "economy" && !paymentsEnabled && !sent ? <div className="mt-6">{manager}</div> : null}
        {tier === "economy" ? (
          <Link to="/economy" className="mt-6 inline-flex min-h-12 items-center bg-burgundy px-5 text-sm text-cream">
            Перейти в конструктор
          </Link>
        ) : sent ? (
          paymentsEnabled ? (
            <div className="mt-8 space-y-4 text-sm">
              <p className="font-serif text-3xl">Заявка {sent} сохранена</p>
              <p>Деньги не списаны. Оплата через ЕРИП откроется после договора с bePaid. Напишите нам это сообщение, чтобы мы не потеряли заявку.</p>
              <a className="inline-flex min-h-11 items-center text-ink underline" href={whatsappHref(letter)}>
                Открыть WhatsApp
              </a>
              <a className="ml-4 inline-flex min-h-11 items-center text-ink underline" href={mailtoHref(`Заявка ${sent}`, letter)}>
                Написать на {site.email}
              </a>
            </div>
          ) : (
            <div className="mt-8 space-y-4 text-sm">
              <p className="font-serif text-3xl">Заявка {sent} сохранена</p>
              <p>Номер уже в тексте сообщения менеджеру. Деньги не списаны.</p>
              {manager}
              <a className="inline-flex min-h-11 items-center text-ink underline" href={mailtoHref(`Заявка ${sent}`, letter)}>
                Написать на {site.email}
              </a>
            </div>
          )
        ) : (
          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (ready) submit();
            }}
          >
            <label className="text-sm">
              Имя
              <input className="studio-input mt-1" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </label>
            <label className="text-sm">
              Телефон или Telegram
              <input className="studio-input mt-1" value={contact} onChange={(event) => setContact(event.target.value)} autoComplete="tel" />
            </label>
            <label className="text-sm">
              Почта
              <input className="studio-input mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={offerOk} onChange={(event) => setOfferOk(event.target.checked)} />
              <span>
                Принимаю <Link to="/oferta" className="underline" target="_blank">публичную оферту</Link> и <Link to="/vozvrat" className="underline" target="_blank">условия возврата</Link>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={pdOk} onChange={(event) => setPdOk(event.target.checked)} />
              <span>
                Согласен на обработку персональных данных: <Link to="/soglasie" className="underline" target="_blank">согласие</Link>, <Link to="/privacy" className="underline" target="_blank">политика</Link>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={portfolio} onChange={(event) => setPortfolio(event.target.checked)} />
              <span>Разрешаю показать мой сайт в портфолио. Это необязательно.</span>
            </label>
            <MarketingConsent checked={marketing} onChange={setMarketing} />
            <button type="submit" disabled={!ready} className="min-h-12 bg-burgundy text-sm text-cream disabled:opacity-40">
              Отправить заявку
            </button>
            <p className="text-xs text-muted">
              {ready ? "Кнопка не списывает деньги." : `Не хватает: ${missing.join(", ")}.`}
            </p>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
