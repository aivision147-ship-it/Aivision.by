import { createFileRoute, Link } from "@tanstack/react-router";
import { DocPage, Block } from "@/components/studio/doc-page";
import { ManagerPay } from "@/components/studio/manager-pay";
import { paymentsEnabled } from "@/lib/site";

export const Route = createFileRoute("/oplata")({
  head: () => ({
    meta: [
      { title: "Оплата — AIVISION STUDIO" },
      {
        name: "description",
        content: paymentsEnabled
          ? "Как оплачивается сайт-приглашение: заявка сейчас, ЕРИП через bePaid после подключения. Услуга электронная, без доставки."
          : "Оплата сайта-приглашения через менеджера: напишите в WhatsApp, Viber или Telegram — выставим счёт",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://aivision.by/oplata" }],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  return (
    <DocPage kicker="Оплата" title="Оплата и получение услуги">
      <Block title="Что происходит сейчас">
        {paymentsEnabled ? (
          <p>Оплата через ЕРИП ещё не включена: нет договора с bePaid и тестового магазина. Кнопка на экране заказа не списывает деньги. Вы оставляете заявку, мы связываемся и подтверждаем сумму.</p>
        ) : (
          <ManagerPay />
        )}
        <p>Когда оплата откроется, счёт будет в белорусских рублях. Для Middle — ссылка и QR ЕРИП на каждый заказ. Карты, Apple Pay и Google Pay подключим позже. Данные карты на наш сайт не попадают: страница оплаты будет на стороне bePaid.</p>
      </Block>
      <Block title="Как вы получаете услугу">
        <p>Доставки нет. Это электронная услуга.</p>
        <p>Economy — картинка, которую вы скачиваете сами, без счёта.</p>
        <p>Middle — сайт на поддомене после подтверждения оплаты. До этого в конструкторе страница помечена как демо.</p>
        <p>Premium и Luxury — не публикуются сами. Сначала предоплата 50%, затем мы собираем страницу, потом остаток. Срок изготовления 3–10 дней от предоплаты.</p>
      </Block>
      <Block title="Цены">
        <p>
          Актуальные цены на странице <Link to="/tarify" className="text-ink underline">тарифов</Link>. Economy — 0, Middle — 45, Premium — 85, Luxury — от 100 BYN.
        </p>
        <p>
          Возврат описан в <Link to="/vozvrat" className="text-ink underline">условиях возврата</Link>.
        </p>
      </Block>
    </DocPage>
  );
}
