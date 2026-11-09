import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlowShell } from "@/components/flow/shell";
import { DemoReminder, useDemoCoupleReminder } from "@/components/middle/demo-reminder";
import { ManagerPay } from "@/components/studio/manager-pay";
import { MarketingConsent } from "@/components/studio/marketing-consent";
import { postStudioOrder } from "@/lib/order-client";
import { paymentsEnabled } from "@/lib/site";
import { subdomainError, subdomainIdeas } from "@/lib/subdomain";
import { loadVariants, type CabinetVariant } from "@/lib/variants";

export const Route = createFileRoute("/publikaciya")({
  head: () => ({
    meta: [
      { title: "Публикация — AIVISION STUDIO" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PublishPage,
});

function PublishPage() {
  const [names, setNames] = useState({ first: "", second: "", date: "" });
  const [slug, setSlug] = useState("");
  const [method, setMethod] = useState<"card" | "erip">("card");
  const [oferta, setOferta] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [portfolio, setPortfolio] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState("");
  const [chosen, setChosen] = useState<CabinetVariant | null>(null);
  const [ready, setReady] = useState(false);
  const showDemoReminder = useDemoCoupleReminder({
    ready,
    templateId: chosen?.templateId,
    partner1: chosen?.draft.partner1,
    partner2: chosen?.draft.partner2,
    date: chosen?.draft.date,
  });
  useEffect(() => {
    const picked = loadVariants().find((item) => item.pay) ?? null;
    setChosen(picked);
    const first = picked?.partner1 ?? "";
    const second = picked?.partner2 ?? "";
    const date = picked?.draft.date ?? "";
    setNames({ first, second, date });
    const idea = subdomainIdeas(first, second, date)[0];
    if (idea) setSlug(idea);
    setReady(true);
  }, []);
  const error = slug ? subdomainError(slug) : "Введите адрес.";
  const ideas = subdomainIdeas(names.first, names.second, names.date);
  function pay(event: React.FormEvent) {
    event.preventDefault();
    if (error || !oferta || !privacy || !chosen) return;
    const raw = localStorage.getItem("aiv-middle-orders");
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    list.unshift({
      at: new Date().toISOString(),
      slug,
      method: paymentsEnabled ? (method === "card" ? "карта" : "ЕРИП") : "менеджер",
      names: `${names.first} и ${names.second}`,
      sum: "45 BYN",
      portfolio,
      templateId: chosen?.templateId ?? "",
    });
    localStorage.setItem("aiv-middle-orders", JSON.stringify(list.slice(0, 20)));
    postStudioOrder({
      source: "publikaciya",
      partner1: names.first,
      partner2: names.second,
      email,
      phone,
      weddingDate: names.date,
      tier: "middle",
      slug,
      note: chosen.templateName,
      marketing,
    });
    setNotice("held");
  }
  return (
    <FlowShell>
      <h1 className="font-serif text-5xl">Публикация</h1>
      {showDemoReminder ? <div className="mt-6 max-w-xl"><DemoReminder /></div> : null}
      <p className="mt-3 max-w-2xl text-sm text-muted">Мидл — 45 BYN. Эконом остаётся картинкой и здесь не оплачивается. Допы без цены в счёт не входят.</p>
      {!chosen ? <p className="mt-6 text-sm">Сначала сохраните вариант и выберите один к оплате в <Link to="/kabinet" className="text-burgundy underline">кабинете</Link>.</p> : <p className="mt-6 text-sm">К оплате: {chosen.partner1} и {chosen.partner2}, {chosen.templateName}.</p>}
      {!paymentsEnabled ? (
        <div className="mt-6 max-w-xl">
          <ManagerPay tier="Мидл" template={chosen?.templateName} />
        </div>
      ) : null}
      <form className="mt-8 grid max-w-xl gap-4" onSubmit={pay}>
        <label className="text-sm">Адрес сайта
          <span className="mt-1 flex items-center gap-2">
            <input className="studio-input" value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} />
            <span className="shrink-0 text-muted">.aivision.by</span>
          </span>
        </label>
        {error ? <p className="text-sm text-burgundy">{error}</p> : <p className="text-sm text-muted">Формат верный. Занят ли адрес у других пар, проверим на сервере, когда он появится.</p>}
        {ideas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {ideas.map((idea) => (
              <button key={idea} type="button" className="min-h-10 rounded-full border border-line px-3 text-sm" onClick={() => setSlug(idea)}>{idea}</button>
            ))}
          </div>
        ) : null}
        {paymentsEnabled ? (
          <fieldset className="grid gap-2">
            <legend className="text-sm">Как платить</legend>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="pay" checked={method === "card"} onChange={() => setMethod("card")} />Карта, bePaid</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="pay" checked={method === "erip"} onChange={() => setMethod("erip")} />ЕРИП</label>
          </fieldset>
        ) : (
          <p className="text-sm">Адрес нужен, чтобы менеджер понимал, какой сайт выставлять в счёт. Деньги здесь не списываются.</p>
        )}
        <p className="text-sm">К оплате: 45 BYN.</p>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={oferta} onChange={(event) => setOferta(event.target.checked)} />Ознакомлен(а) с <Link to="/oferta" className="underline">публичной офертой</Link></label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={privacy} onChange={(event) => setPrivacy(event.target.checked)} />Согласен на <Link to="/privacy" className="underline">обработку персональных данных</Link></label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={portfolio} onChange={(event) => setPortfolio(event.target.checked)} />Разрешаю показать сайт в портфолио. Это необязательно.</label>
        <label className="text-sm">Почта, если есть<input className="studio-input mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="text-sm">Телефон<input className="studio-input mt-1" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
        <MarketingConsent checked={marketing} onChange={setMarketing} />
        <button type="submit" className="min-h-12 bg-burgundy px-5 text-sm text-cream disabled:opacity-40" disabled={!chosen || Boolean(error) || !oferta || !privacy}>{paymentsEnabled ? "Перейти к оплате" : "Сохранить адрес для счёта"}</button>
      </form>
      {notice ? (
        paymentsEnabled ? (
          <div className="mt-6 max-w-xl border border-line bg-cream p-4 text-sm">
            <p>Окно bePaid и счёт ЕРИП ещё не подключены. Деньги не списаны, сайт гостям не открыт.</p>
            <p className="mt-2">Запись об этой попытке лежит в кабинете браузера. Гость по общей ссылке видит заглушку.</p>
            <p className="mt-3 flex gap-4">
              <Link to="/skoro" className="text-burgundy underline">Заглушка для гостя</Link>
              <Link to="/kabinet" className="text-burgundy underline">Кабинет</Link>
            </p>
          </div>
        ) : (
          <div className="mt-6 max-w-xl border border-line bg-cream p-4 text-sm">
            <p>Адрес записан в этом браузере. Деньги не списаны, сайт гостям не открыт. Счёт попросите у менеджера кнопками выше.</p>
            <p className="mt-3 flex gap-4">
              <Link to="/skoro" className="text-burgundy underline">Заглушка для гостя</Link>
              <Link to="/kabinet" className="text-burgundy underline">Кабинет</Link>
            </p>
          </div>
        )
      ) : null}
    </FlowShell>
  );
}
