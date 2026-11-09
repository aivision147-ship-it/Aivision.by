import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FlowShell } from "@/components/flow/shell";
import { CustomBanner } from "@/components/portfolio/blocks";
import { showcase, showcaseStyles } from "@/data/showcase";
import { site } from "@/lib/site";

export const Route = createFileRoute("/shablony")({
  head: () => ({
    meta: [
      { title: "Шаблоны приглашений — AIVISION STUDIO" },
      { name: "description", content: "39 готовых шаблонов сайта-приглашения. Эконом 0 BYN, Мидл 45 BYN." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: `${site.origin}/shablony` }],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const navigate = useNavigate();
  const [style, setStyle] = useState("все");
  const [tone, setTone] = useState("все");
  const [motion, setMotion] = useState("все");
  const [sort, setSort] = useState("как в каталоге");
  const items = useMemo(() => {
    const list = showcase.filter((item) => {
      if (style !== "все" && item.style !== style) return false;
      if (tone === "светлые" && item.tone !== "light") return false;
      if (tone === "тёмные" && item.tone !== "dark") return false;
      if (motion === "с анимацией" && !item.animated) return false;
      if (motion === "без анимации" && item.animated) return false;
      return true;
    });
    if (sort === "по имени") return [...list].sort((a, b) => a.name.localeCompare(b.name, "ru"));
    return list;
  }, [style, tone, motion, sort]);

  function start(id: string) {
    sessionStorage.setItem("aiv-pick-template", id);
    void navigate({ to: "/middle" });
  }

  const cells: Array<{ kind: "item"; item: (typeof items)[number] } | { kind: "banner"; key: string }> = [];
  items.forEach((item, index) => {
    cells.push({ kind: "item", item });
    if ((index + 1) % 8 === 0 && index + 1 < items.length) cells.push({ kind: "banner", key: `banner-${index}` });
  });

  return (
    <FlowShell>
      <p className="text-xs tracking-wide text-muted uppercase">Бесплатно до публикации</p>
      <h1 className="mt-2 font-serif text-5xl">Шаблоны</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">39 образцов. Эконом остаётся картинкой и сюда не входит. Анимация обложки помечена отдельно: в Мидле за 45 BYN образец всё равно можно собрать.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Filter label="Стиль" value={style} options={["все", ...showcaseStyles]} onChange={setStyle} />
        <Filter label="Фон" value={tone} options={["все", "светлые", "тёмные"]} onChange={setTone} />
        <Filter label="Движение" value={motion} options={["все", "с анимацией", "без анимации"]} onChange={setMotion} />
        <Filter label="Порядок" value={sort} options={["как в каталоге", "по имени"]} onChange={setSort} />
      </div>
      <p className="mt-4 text-sm text-muted">{items.length} на экране</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cells.map((cell) =>
          cell.kind === "banner" ? (
            <li key={cell.key} className="col-span-2 sm:col-span-3 lg:col-span-4"><CustomBanner /></li>
          ) : (
            <li key={cell.item.id} className="overflow-hidden rounded-2xl border border-line bg-cream">
              <Link to="/shablony/$id" params={{ id: cell.item.id }}>
                <img src={cell.item.thumb} alt="" className="aspect-[3/4] w-full object-cover object-top" />
              </Link>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate font-serif text-2xl">{cell.item.name}</h2>
                  <span className="text-xs text-muted">{cell.item.code}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{cell.item.style} · {cell.item.tone === "dark" ? "тёмный фон" : "светлый фон"}{cell.item.animated ? " · анимация" : ""}</p>
                {cell.item.simplifiedLux ? <p className="mt-1 text-xs text-burgundy">упрощённая версия стиля Люкс</p> : null}
                <div className="mt-3">
                  <button type="button" className="min-h-10 w-full rounded-full bg-burgundy text-sm text-cream" onClick={() => start(cell.item.id)}>Начать</button>
                </div>
              </div>
            </li>
          ),
        )}
      </ul>
      <div className="mt-6"><CustomBanner /></div>
    </FlowShell>
  );
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="text-sm">
      <span className="mr-2 text-muted">{label}</span>
      <select className="studio-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
