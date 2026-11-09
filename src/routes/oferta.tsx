import { createFileRoute, Link } from "@tanstack/react-router";
import { DocPage, Block } from "@/components/studio/doc-page";
import { company, site } from "@/lib/site";

export const Route = createFileRoute("/oferta")({
  head: () => ({
    meta: [
      { title: "Публичная оферта — AIVISION STUDIO" },
      { name: "description", content: "Публичный договор на изготовление сайта-приглашения. ЧТУП «Инполи»." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://aivision.by/oferta" }],
  }),
  component: OfferPage,
});

function OfferPage() {
  return (
    <DocPage kicker="Документ" title="Публичная оферта">
      <p>
        {company.name}, УНП {company.unp} (далее — исполнитель), предлагает заключить договор на изготовление сайта-приглашения или карточки-приглашения. Это публичная оферта: условия приняты целиком, если заказ оплачен. Пока оплата через bePaid не подключена, заявка на сайте договором ещё не является. Договор считается заключённым с момента поступления оплаты.
      </p>
      <Block title="Услуга">
        <p>Исполнитель делает электронное приглашение на свадьбу: карточку-картинку или сайт, который гость открывает по ссылке на телефоне. Печатные открытки не делаем. Сайты пар размещаются на поддомене aivision.by и закрыты от поиска.</p>
      </Block>
      <Block title="Тарифы и цена">
        <p>
          Состав и цены — на странице <Link to="/tarify" className="text-ink underline">тарифов</Link>. Economy — 0 BYN, картинка без размещения. Middle — 45 BYN, оплата целиком. Premium — 85 BYN, предоплата 50% и остаток после согласования. Luxury — от 100 BYN, точная сумма согласуется, предоплата 50%. Цена фиксируется в заказе и после оплаты не меняется. Валюта — белорусский рубль.
        </p>
      </Block>
      <Block title="Срок">
        <p>Economy и Middle заказчик собирает сам. Premium и Luxury исполнитель делает за 3–10 дней с даты предоплаты, если материалы уже переданы. Срок не идёт, пока мы ждём правки или фото. Срок размещения: Middle — до дня свадьбы и ещё месяц; Premium — 6 месяцев с дня покупки; Luxury — 12 месяцев с дня покупки.</p>
      </Block>
      <Block title="Оплата">
        <p>
          Способ оплаты описан на странице <Link to="/oplata" className="text-ink underline">оплаты</Link>. После подключения bePaid подтверждением оплаты будет уведомление платёжного сервиса, а не возврат на страницу «спасибо».
        </p>
      </Block>
      <Block title="Содержание сайта">
        <p>Тексты, имена и фото даёт заказчик. Он отвечает за то, что имеет право их размещать. Гость, у которого есть ссылка, может открыть страницу. Ответы гостей обрабатываются, чтобы передать их заказчику, и не используются для рекламы.</p>
      </Block>
      <Block title="Возврат и данные">
        <p>
          Порядок возврата — в <Link to="/vozvrat" className="text-ink underline">условиях возврата</Link>. Персональные данные — в <Link to="/privacy" className="text-ink underline">политике</Link> и <Link to="/soglasie" className="text-ink underline">согласии</Link>.
        </p>
      </Block>
      <Block title="Реквизиты">
        <p>{company.name}, УНП {company.unp}</p>
        <p>Почта: {site.email}. Телефон: {site.whatsappDisplay}.</p>
        <p>Юридический адрес, банк и расчётный счёт будут добавлены в эту редакцию до включения оплаты. До этого счёт на оплату не выставляется.</p>
      </Block>
    </DocPage>
  );
}
