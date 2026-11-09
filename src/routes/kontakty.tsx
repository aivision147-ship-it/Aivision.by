import { createFileRoute } from "@tanstack/react-router";
import { DocPage, Block } from "@/components/studio/doc-page";
import { company, site, whatsappHref } from "@/lib/site";

export const Route = createFileRoute("/kontakty")({
  head: () => ({
    meta: [
      { title: "Контакты — AIVISION STUDIO" },
      { name: "description", content: "Контакты AIVISION STUDIO: ЧТУП «Инполи», УНП 291630474, почта и WhatsApp." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://aivision.by/kontakty" }],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  return (
    <DocPage kicker="Контакты" title="Контакты и реквизиты">
      <Block title={company.name}>
        <p>УНП {company.unp}</p>
        <p>Работаем по всей Беларуси, приезжать в студию не нужно.</p>
        <p>
          Почта: <a className="text-ink underline" href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <p>
          Телефон: <a className="text-ink underline" href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
        </p>
        <p>
          WhatsApp: <a className="text-ink underline" href={whatsappHref()}>{site.phoneDisplay}</a>
        </p>
        <p>
          Viber: <a className="text-ink underline" href={site.viber}>{site.phoneDisplay}</a>
        </p>
        <p>
          Telegram: <a className="text-ink underline" href={site.telegram}>{site.phoneDisplay}</a>
        </p>
        <p>Режим связи: ежедневно, отвечаем в рабочее время. Если до свадьбы меньше трёх недель, напишите это в первом сообщении.</p>
      </Block>
      <Block title="Чего здесь пока нет">
        <p>Юридический адрес, дата регистрации и банковский счёт не указаны, пока их нет в карточке для договора с bePaid. Подставлять чужие реквизиты мы не будем.</p>
      </Block>
    </DocPage>
  );
}
