import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FlowShell } from "@/components/flow/shell";
import { MarketingConsent } from "@/components/studio/marketing-consent";
import { styleTagLabel, type StyleTag } from "@/data/style-tags";
import { postStudioOrder } from "@/lib/order-client";

export const Route = createFileRoute("/brief")({
  validateSearch: (search: Record<string, unknown>) => {
    const result: { tier?: "premium" | "lux"; style?: string; ref?: string } = {};
    if (search.tier === "lux" || search.tier === "premium") result.tier = search.tier;
    if (typeof search.style === "string" && search.style) result.style = search.style;
    if (typeof search.ref === "string" && search.ref) result.ref = search.ref;
    return result;
  },
  head: () => ({
    meta: [
      { title: "Заказать под ключ — AIVISION STUDIO" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: BriefPage,
});

const empty = {
  partner1: "",
  partner2: "",
  date: "",
  city: "",
  venue: "",
  tier: "premium" as "premium" | "lux",
  texts: "напишите за нас",
  note: "",
  contact: "",
  email: "",
  oferta: false,
  privacy: false,
  marketing: false,
};

function BriefPage() {
  const search = Route.useSearch();
  const styleName = search.style && search.style in styleTagLabel ? styleTagLabel[search.style as StyleTag] : search.style;
  const [form, setForm] = useState({ ...empty, tier: search.tier ?? empty.tier });
  const [done, setDone] = useState(false);
  function set<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.partner1.trim() || !form.partner2.trim() || !form.date || !form.city.trim() || !form.contact.trim() || !form.oferta || !form.privacy) return;
    const raw = localStorage.getItem("aiv-briefs");
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    list.unshift({ ...form, style: search.style, ref: search.ref, at: new Date().toISOString() });
    localStorage.setItem("aiv-briefs", JSON.stringify(list.slice(0, 20)));
    postStudioOrder({
      source: "brief",
      partner1: form.partner1.trim(),
      partner2: form.partner2.trim(),
      email: form.email.trim(),
      phone: form.contact.trim(),
      weddingDate: form.date,
      tier: form.tier,
      note: [form.city, form.venue, form.note].filter(Boolean).join(". "),
      marketing: form.marketing,
    });
    setDone(true);
  }
  return (
    <FlowShell>
      <p className="text-xs tracking-wide text-muted uppercase">Премиум 85 BYN · Люкс от 100 BYN</p>
      <h1 className="mt-2 font-serif text-5xl">Заказать под ключ</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">Бриф без регистрации. Предоплата 50% спишется, когда подключим кассу. Сейчас заявка остаётся только в этом браузере.</p>
      {styleName ? <p className="mt-3 text-sm">Стиль: {styleName}{search.ref ? ` · ориентир ${search.ref}` : ""}</p> : null}
      {done ? (
        <p className="mt-8 max-w-xl text-lg">Заявка записана в кабинете этого браузера. Письмо не отправлено: почта ещё не подключена.</p>
      ) : (
        <form className="mt-8 grid max-w-xl gap-4" onSubmit={submit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Имя<input className="studio-input mt-1" value={form.partner1} onChange={(event) => set("partner1", event.target.value)} /></label>
            <label className="text-sm">Имя<input className="studio-input mt-1" value={form.partner2} onChange={(event) => set("partner2", event.target.value)} /></label>
          </div>
          <label className="text-sm">Дата<input className="studio-input mt-1" type="date" value={form.date} onChange={(event) => set("date", event.target.value)} /></label>
          <label className="text-sm">Город<input className="studio-input mt-1" value={form.city} onChange={(event) => set("city", event.target.value)} /></label>
          <label className="text-sm">Площадка<input className="studio-input mt-1" value={form.venue} onChange={(event) => set("venue", event.target.value)} /></label>
          <div className="flex gap-2">
            <button type="button" className={form.tier === "premium" ? "min-h-10 rounded-full bg-burgundy px-4 text-sm text-cream" : "min-h-10 rounded-full border border-line px-4 text-sm"} onClick={() => set("tier", "premium")}>Премиум, 85</button>
            <button type="button" className={form.tier === "lux" ? "min-h-10 rounded-full bg-burgundy px-4 text-sm text-cream" : "min-h-10 rounded-full border border-line px-4 text-sm"} onClick={() => set("tier", "lux")}>Люкс, от 100</button>
          </div>
          <label className="text-sm">Тексты
            <select className="studio-input mt-1" value={form.texts} onChange={(event) => set("texts", event.target.value)}>
              <option value="напишите за нас">Напишите за нас</option>
              <option value="пришлю свои">Пришлю свои</option>
            </select>
          </label>
          <label className="text-sm">Пожелания по цвету и музыке<textarea className="studio-input mt-1 min-h-24" value={form.note} onChange={(event) => set("note", event.target.value)} /></label>
          <label className="text-sm">Телефон или Telegram<input className="studio-input mt-1" value={form.contact} onChange={(event) => set("contact", event.target.value)} /></label>
          <label className="text-sm">Почта, если есть<input className="studio-input mt-1" type="email" value={form.email} onChange={(event) => set("email", event.target.value)} /></label>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={form.oferta} onChange={(event) => set("oferta", event.target.checked)} />Принимаю публичную оферту и условия возврата</label>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={form.privacy} onChange={(event) => set("privacy", event.target.checked)} />Согласен на обработку персональных данных. <Link to="/soglasie" className="underline">Согласие</Link></label>
          <MarketingConsent checked={form.marketing} onChange={(value) => set("marketing", value)} />
          <button type="submit" className="min-h-12 bg-burgundy px-5 text-sm text-cream disabled:opacity-40" disabled={!form.oferta || !form.privacy}>Отправить бриф</button>
        </form>
      )}
    </FlowShell>
  );
}
