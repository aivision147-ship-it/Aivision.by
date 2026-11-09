import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FlowShell } from "@/components/flow/shell";
import { JsonLd, TemplateBanner, WorkCard, portfolioJsonLd } from "@/components/portfolio/blocks";
import { portfolio, publicPortfolio } from "@/data/portfolio";
import { styleTagLabel, styleTags, type StyleTag } from "@/data/style-tags";
import { site } from "@/lib/site";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Свадебные сайты под ключ — работы студии AIVISION, Минск" },
      {
        name: "description",
        content: "Индивидуальные свадебные сайты студии AIVISION: Премиум от 85 BYN и Люкс от 100 BYN. Не шаблоны.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: `${site.origin}/portfolio` }],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const [tier, setTier] = useState<"все" | "premium" | "lux">("все");
  const [style, setStyle] = useState<"все" | StyleTag>("все");
  const items = useMemo(
    () =>
      portfolio.filter((item) => {
        if (tier !== "все" && item.tier !== tier) return false;
        if (style !== "все" && !item.styleTags.includes(style)) return false;
        return true;
      }),
    [tier, style],
  );
  return (
    <FlowShell>
      <JsonLd data={portfolioJsonLd(publicPortfolio())} />
      <h1 className="font-serif text-4xl md:text-5xl">Свадебные сайты под ключ — наши работы</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Здесь только индивидуальные сайты: Премиум от 85 BYN и Люкс от 100 BYN. Это не каталог шаблонов.
        Готовый образец можно собрать самому — ссылка на шаблоны внизу страницы.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <label className="text-sm">
          <span className="mr-2 text-muted">Тариф</span>
          <select className="studio-input" value={tier} onChange={(event) => setTier(event.target.value as typeof tier)}>
            <option value="все">все</option>
            <option value="premium">Премиум</option>
            <option value="lux">Люкс</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mr-2 text-muted">Стиль</span>
          <select className="studio-input" value={style} onChange={(event) => setStyle(event.target.value as typeof style)}>
            <option value="все">все</option>
            {styleTags.map((tag) => (
              <option key={tag} value={tag}>{styleTagLabel[tag]}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6 grid gap-6">
        {items.length === 0 ? <p className="text-sm text-muted">В этом сочетании пока ничего нет.</p> : items.map((work) => <WorkCard key={work.slug} work={work} />)}
      </div>
      <TemplateBanner />
    </FlowShell>
  );
}
