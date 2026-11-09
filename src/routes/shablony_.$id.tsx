import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FlowShell } from "@/components/flow/shell";
import { WorkCard, tagName } from "@/components/portfolio/blocks";
import { worksForTemplate } from "@/data/portfolio-match";
import { showcaseById } from "@/data/showcase";

export const Route = createFileRoute("/shablony_/$id")({
  head: ({ params }) => {
    const item = showcaseById(params.id);
    return {
      meta: [
        { title: item ? `${item.code} ${item.name} — шаблон приглашения` : "Шаблон не найден" },
        { name: "description", content: item ? `Шаблон ${item.name}. Эконом 0 BYN или Мидл 45 BYN.` : "Такого шаблона нет." },
        { name: "robots", content: "index, follow" },
      ],
    };
  },
  component: TemplatePage,
});

function TemplatePage() {
  const { id } = Route.useParams();
  const item = showcaseById(id);
  const navigate = useNavigate();
  if (!item) {
    return (
      <FlowShell>
        <h1 className="font-serif text-5xl">Такого шаблона нет</h1>
        <Link to="/shablony" className="mt-4 inline-flex text-burgundy underline">Все шаблоны</Link>
      </FlowShell>
    );
  }
  const works = worksForTemplate(item.styleTags, 3);
  function start() {
    sessionStorage.setItem("aiv-pick-template", item!.id);
    void navigate({ to: "/middle" });
  }
  return (
    <FlowShell>
      <p className="text-xs text-muted">{item.code} · 0 или 45 BYN</p>
      <h1 className="mt-2 font-serif text-5xl">{item.name}</h1>
      <p className="mt-2 text-sm text-muted">{item.styleTags.map(tagName).join(" · ")}{item.animated ? " · анимация обложки" : ""}</p>
      {item.simplifiedLux ? <p className="mt-2 text-sm text-burgundy">упрощённая версия стиля Люкс</p> : null}
      <img src={item.thumb} alt="" className="mt-6 aspect-[3/4] w-full max-w-sm object-cover object-top" />
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="min-h-11 bg-burgundy px-5 text-sm text-cream" onClick={start}>Начать</button>
        <Link to="/demo/$id" params={{ id: item.id }} className="inline-flex min-h-11 items-center justify-center border border-line px-5 text-sm">Открыть образец</Link>
      </div>
      <section className="mt-12">
        <h2 className="font-serif text-3xl">Хотите такое же, но уникальное? Работы в этом стиле</h2>
        <div className="mt-4 grid gap-6">
          {works.map((work) => <WorkCard key={work.slug} work={work} />)}
        </div>
        <a href="/portfolio" className="mt-6 inline-flex min-h-12 items-center bg-burgundy px-5 text-sm text-cream">Заказать под ключ от 85 BYN</a>
      </section>
    </FlowShell>
  );
}
