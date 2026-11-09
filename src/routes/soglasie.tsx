import { createFileRoute, Link } from "@tanstack/react-router";
import { DocPage, Block } from "@/components/studio/doc-page";
import { company, site } from "@/lib/site";

export const Route = createFileRoute("/soglasie")({
  head: () => ({
    meta: [
      { title: "Согласие на обработку персональных данных — AIVISION STUDIO" },
      { name: "description", content: "Текст согласия, которое заказчик отмечает отдельно от оферты." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://aivision.by/soglasie" }],
  }),
  component: ConsentPage,
});

function ConsentPage() {
  return (
    <DocPage kicker="Документ" title="Согласие на обработку персональных данных">
      <p>
        Я даю {company.name}, УНП {company.unp}, согласие обрабатывать мои имя, телефон или имя в Telegram, адрес электронной почты и содержание заявки.
      </p>
      <Block title="Зачем">
        <p>Чтобы связаться по заказу, выставить счёт, когда откроется оплата, изготовить и разместить сайт-приглашение, направить ответы гостей выбранным способом и хранить доказательство, что я принял оферту.</p>
      </Block>
      <Block title="Как это устроено">
        <p>
          Согласие отдельное от принятия <Link to="/oferta" className="text-ink underline">оферты</Link>. Оно не отмечено заранее. Подробности — в <Link to="/privacy" className="text-ink underline">политике</Link>. Отозвать согласие можно письмом на {site.email}. Если договор уже оплачен, данные, нужные для его исполнения и учёта, остаются на законном основании.
        </p>
        <p>Отдельная галочка «показать сайт в портфолио» этим согласием не заменяется и без неё сайт пары в примеры не попадает.</p>
      </Block>
    </DocPage>
  );
}
