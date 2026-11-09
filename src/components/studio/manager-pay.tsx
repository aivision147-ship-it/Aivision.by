import { Link } from "@tanstack/react-router";
import { site, whatsappHref } from "@/lib/site";

export function payRequestText(input: { tier?: string; template?: string; orderId?: string }) {
  const parts = [
    input.tier ? `тариф ${input.tier}` : "",
    input.template ? `шаблон ${input.template}` : "",
    input.orderId ? `заявка ${input.orderId}` : "",
  ].filter(Boolean);
  const about = parts.length > 0 ? parts.join(", ") : "сайт-приглашение";
  return `Здравствуйте! Хочу оплатить ${about}. Выставьте, пожалуйста, счёт.`;
}

export function ManagerPay({ tier, template, orderId }: { tier?: string; template?: string; orderId?: string }) {
  const text = payRequestText({ tier, template, orderId });
  const telegram = `${site.telegram}?text=${encodeURIComponent(text)}`;
  const viber = `${site.viber}&text=${encodeURIComponent(text)}`;
  return (
    <div className="border-2 border-burgundy bg-cream p-5">
      <p className="font-serif text-2xl leading-snug text-ink md:text-3xl">
        Оплата временно через менеджера — напишите нам, и мы выставим счёт.
      </p>
      <p className="mt-3 text-base text-ink">Деньги сейчас не списываются. Счёт пришлём в мессенджер в течение рабочего дня.</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <a className="inline-flex min-h-12 items-center justify-center bg-burgundy px-4 text-center text-sm text-cream" href={whatsappHref(text)} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a className="inline-flex min-h-12 items-center justify-center border border-line px-4 text-center text-sm" href={viber}>
          Viber
        </a>
        <a className="inline-flex min-h-12 items-center justify-center border border-line px-4 text-center text-sm" href={telegram} target="_blank" rel="noreferrer">
          Telegram
        </a>
      </div>
      <p className="mt-4 text-sm">
        <a className="underline" href={`tel:${site.phone}`}>
          {site.phoneDisplay}
        </a>
        {" · "}
        <Link to="/brief" className="underline">
          Или оставить заявку
        </Link>
      </p>
    </div>
  );
}
