import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlowShell } from "@/components/flow/shell";
import { choosePay, loadVariants, type CabinetVariant } from "@/lib/variants";

export const Route = createFileRoute("/kabinet")({
  head: () => ({
    meta: [
      { title: "Кабинет — AIVISION STUDIO" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CabinetPage,
});

type OrderFile = { at: string; slug: string; method: string; names: string; sum: string };
type BriefFile = { at: string; partner1: string; partner2: string; tier: string; contact: string };

type AnswersLink = { href: string; couple?: string };

function CabinetPage() {
  const navigate = useNavigate();
  const [variants, setVariants] = useState<CabinetVariant[]>([]);
  const [orders, setOrders] = useState<OrderFile[]>([]);
  const [briefs, setBriefs] = useState<BriefFile[]>([]);
  const [answers, setAnswers] = useState<AnswersLink | null>(null);
  useEffect(() => {
    setVariants(loadVariants());
    const orderRaw = localStorage.getItem("aiv-middle-orders");
    setOrders(orderRaw ? (JSON.parse(orderRaw) as OrderFile[]) : []);
    const briefRaw = localStorage.getItem("aiv-briefs");
    setBriefs(briefRaw ? (JSON.parse(briefRaw) as BriefFile[]) : []);
    const answersRaw = localStorage.getItem("aiv-answers-link");
    if (answersRaw) {
      try {
        const parsed = JSON.parse(answersRaw) as AnswersLink;
        if (parsed.href?.includes("/answers?token=")) setAnswers(parsed);
      } catch {
        setAnswers(null);
      }
    }
  }, []);
  function openVariant(item: CabinetVariant) {
    localStorage.setItem("aiv-middle-draft-v1", JSON.stringify({ templateId: item.templateId, draft: item.draft }));
    sessionStorage.setItem("aiv-pick-template", item.templateId);
    void navigate({ to: "/middle" });
  }
  return (
    <FlowShell>
      <h1 className="font-serif text-5xl">Кабинет</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">Здесь только то, что сохранено в этом браузере. Входа по почте и общего списка заказов ещё нет.</p>
      {answers ? (
        <p className="mt-4 text-sm">
          <a className="text-burgundy underline" href={answers.href}>Ответы гостей{answers.couple ? ` — ${answers.couple}` : ""}</a>
        </p>
      ) : null}
      <section className="mt-8 border-t border-line pt-5">
        <h2 className="font-serif text-3xl">Черновики</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">До трёх заполненных вариантов. К оплате выбирается один.</p>
        {variants.length === 0 ? <p className="mt-3 text-sm text-muted">Черновиков нет. Они появятся, когда внизу приглашения нажмёте «Сохранить вариант».</p> : (
          <div className="mt-4 grid max-w-xl grid-cols-3 gap-3">
            {variants.map((item) => (
              <div key={item.id} className={item.pay ? "rounded-2xl border-2 border-burgundy p-1" : "rounded-2xl border border-line p-1"}>
                <button type="button" className="block w-full text-left" onClick={() => openVariant(item)}>
                  <img src={`/template-thumbs/${item.templateId}.jpg`} alt="" className="aspect-[3/4] w-full rounded-xl object-cover object-top" />
                  <span className="mt-2 block text-sm">{item.partner1} и {item.partner2}</span>
                  <span className="block text-xs text-muted">{item.templateName}</span>
                </button>
                <button
                  type="button"
                  className={item.pay ? "mt-2 min-h-10 w-full rounded-full bg-burgundy text-xs text-cream" : "mt-2 min-h-10 w-full rounded-full border border-line text-xs"}
                  onClick={() => setVariants(choosePay(item.id))}
                >
                  {item.pay ? "К оплате" : "Выбрать"}
                </button>
              </div>
            ))}
          </div>
        )}
        {variants.some((item) => item.pay) ? <Link to="/publikaciya" className="mt-4 inline-flex min-h-10 items-center text-sm text-burgundy underline">Оплатить выбранный</Link> : null}
      </section>
      <section className="mt-8 border-t border-line pt-5">
        <h2 className="font-serif text-3xl">Попытки оплаты</h2>
        {orders.length === 0 ? <p className="mt-2 text-sm text-muted">Пока пусто. Деньги нигде не списываются.</p> : (
          <ul className="mt-3 space-y-2 text-sm">
            {orders.map((item) => (
              <li key={item.at}>{item.names} · {item.slug}.aivision.by · {item.method} · {item.sum} · ждёт кассу</li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8 border-t border-line pt-5">
        <h2 className="font-serif text-3xl">Брифы под ключ</h2>
        {briefs.length === 0 ? <p className="mt-2 text-sm text-muted">Заявок нет.</p> : (
          <ul className="mt-3 space-y-2 text-sm">
            {briefs.map((item) => (
              <li key={item.at}>{item.partner1} и {item.partner2} · {item.tier} · {item.contact}</li>
            ))}
          </ul>
        )}
        <Link to="/brief" className="mt-3 inline-flex min-h-10 items-center text-sm text-burgundy underline">Новый бриф</Link>
      </section>
      <p className="mt-8 text-sm"><Link to="/skoro" className="text-burgundy underline">Так гость видит сайт до оплаты</Link></p>
    </FlowShell>
  );
}
