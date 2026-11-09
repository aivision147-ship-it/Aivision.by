import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/answers")({
  head: () => ({
    meta: [
      { title: "Ответы гостей — AIVISION STUDIO" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: AnswersPage,
});

type Reply = {
  name: string;
  attending: string;
  guests: number;
  food: string;
  allergies: string;
  drinks: string[];
  comment: string;
  submittedAt: string;
  updatedAt: string;
};

type Payload = {
  ok: boolean;
  site: {
    couple: string;
    weddingDate: string;
    inviteUrl: string;
    deadline: string;
    tier: string;
    maxGuests: number;
  };
  responses: Reply[];
};

type SortKey = "updatedAt" | "name" | "attending" | "guests";

function AnswersPage() {
  const [phase, setPhase] = useState<"wait" | "bad" | "ok">("wait");
  const [data, setData] = useState<Payload | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "updatedAt", dir: "desc" });

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    if (!/^[a-f0-9]{64}$/.test(token)) {
      setPhase("bad");
      return;
    }
    let stop = false;
    fetch(`/api/answers.php?token=${token}`, { headers: { Accept: "application/json" } })
      .then(async (res) => {
        if (!res.ok) throw new Error("bad");
        return res.json() as Promise<Payload>;
      })
      .then((body) => {
        if (stop || !body.ok) {
          if (!stop) setPhase("bad");
          return;
        }
        localStorage.setItem("aiv-answers-link", JSON.stringify({ href: window.location.href, couple: body.site.couple }));
        setData(body);
        setPhase("ok");
      })
      .catch(() => {
        if (!stop) setPhase("bad");
      });
    return () => {
      stop = true;
    };
  }, []);

  const premium = data?.site.tier === "premium" || data?.site.tier === "luxury";
  const rows = useMemo(() => {
    const list = data?.responses ?? [];
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? list.filter((item) =>
          [item.name, item.food, item.allergies, item.comment, item.drinks.join(" ")].join(" ").toLowerCase().includes(needle),
        )
      : list;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = sort.key === "guests" ? a.guests : a[sort.key];
      const right = sort.key === "guests" ? b.guests : b[sort.key];
      return String(left).localeCompare(String(right), "ru") * dir;
    });
  }, [data, query, sort]);

  function toggleSort(key: SortKey) {
    setSort((current) => (current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "updatedAt" ? "desc" : "asc" }));
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-5">
          <p className="font-serif text-lg whitespace-nowrap wordmark">AiVISION STUDIO</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-5 py-10">
        {phase === "wait" ? <p className="text-sm text-muted">Открываем ответы…</p> : null}
        {phase === "bad" ? <h1 className="font-serif text-5xl">Ссылка недействительна</h1> : null}
        {phase === "ok" && data ? <AnswersBody data={data} rows={rows} premium={premium} query={query} onQuery={setQuery} onSort={toggleSort} /> : null}
      </main>
    </div>
  );
}

function AnswersBody({
  data,
  rows,
  premium,
  query,
  onQuery,
  onSort,
}: {
  data: Payload;
  rows: Reply[];
  premium: boolean;
  query: string;
  onQuery: (value: string) => void;
  onSort: (key: SortKey) => void;
}) {
  const yes = data.responses.filter((item) => item.attending === "yes");
  const no = data.responses.filter((item) => item.attending === "no");
  const people = yes.reduce((sum, item) => sum + item.guests, 0);
  return (
    <>
      <p className="text-xs tracking-label text-burgundy uppercase">Ответы гостей</p>
      <h1 className="mt-2 font-serif text-5xl">{data.site.couple}</h1>
      <ul className="mt-4 space-y-1 text-sm text-ink-soft">
        {data.site.weddingDate ? <li>Дата: {data.site.weddingDate}</li> : null}
        {data.site.deadline ? <li>Ответить до: {data.site.deadline}</li> : null}
        {data.site.inviteUrl ? (
          <li>
            Приглашение: <a className="text-burgundy underline" href={data.site.inviteUrl}>{data.site.inviteUrl}</a>
          </li>
        ) : null}
      </ul>
      {premium ? (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Придут, ответов" value={String(yes.length)} />
          <Stat label="Придут, человек" value={String(people)} />
          <Stat label="Не придут" value={String(no.length)} />
          <Stat label="Всего человек" value={String(people)} />
        </dl>
      ) : null}
      {premium ? <FoodBlock responses={data.responses} /> : null}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <label className="text-sm">
          Поиск
          <input className="studio-input mt-1" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Имя, еда, комментарий" />
        </label>
        <button type="button" className="min-h-11 border border-line px-4 text-sm" onClick={() => downloadCsv(rows)}>
          Скачать CSV
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <Th onClick={() => onSort("name")}>Имя</Th>
              <Th onClick={() => onSort("attending")}>Ответ</Th>
              <Th onClick={() => onSort("guests")}>Гостей</Th>
              <Th onClick={() => onSort("updatedAt")}>Когда</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={`${item.name}-${item.updatedAt}`} className="border-b border-line align-top">
                <td className="py-3 pr-3">
                  <p>{item.name}</p>
                  {item.food ? <p className="text-xs text-muted">Еда: {item.food}</p> : null}
                  {item.allergies ? <p className="text-xs text-muted">Аллергии: {item.allergies}</p> : null}
                  {item.drinks.length ? <p className="text-xs text-muted">Напитки: {item.drinks.join(", ")}</p> : null}
                  {item.comment ? <p className="text-xs text-muted">{item.comment}</p> : null}
                </td>
                <td className="py-3 pr-3">{item.attending === "yes" ? "Придёт" : "Не придёт"}</td>
                <td className="py-3 pr-3">{item.guests}</td>
                <td className="py-3">{item.updatedAt.slice(0, 16).replace("T", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="mt-3 text-sm text-muted">Ответов пока нет.</p> : null}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-cream p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-3xl">{value}</dd>
    </div>
  );
}

function Th({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <th className="py-2 pr-3 font-normal">
      <button type="button" className="text-left text-xs tracking-label text-burgundy uppercase" onClick={onClick}>{children}</button>
    </th>
  );
}

function FoodBlock({ responses }: { responses: Reply[] }) {
  const food = responses.filter((item) => item.attending === "yes" && (item.food || item.allergies));
  const drinks = new Map<string, string[]>();
  for (const item of responses) {
    if (item.attending !== "yes") continue;
    for (const drink of item.drinks) {
      const names = drinks.get(drink) ?? [];
      names.push(item.name);
      drinks.set(drink, names);
    }
  }
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <section className="border border-line p-4">
        <h2 className="font-serif text-3xl">Еда и аллергии</h2>
        {food.length === 0 ? <p className="mt-2 text-sm text-muted">Пока никто не написал.</p> : (
          <ul className="mt-3 space-y-2 text-sm">
            {food.map((item) => (
              <li key={item.name}>
                <b>{item.name}</b>
                {item.food ? ` — ${item.food}` : ""}
                {item.allergies ? ` Аллергии: ${item.allergies}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="border border-line p-4">
        <h2 className="font-serif text-3xl">Напитки</h2>
        {drinks.size === 0 ? <p className="mt-2 text-sm text-muted">Пока никто не выбрал.</p> : (
          <ul className="mt-3 space-y-2 text-sm">
            {[...drinks.entries()].map(([drink, names]) => (
              <li key={drink}><b>{drink}</b> — {names.length}: {names.join(", ")}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function downloadCsv(rows: Reply[]) {
  const header = ["Имя", "Придёт", "Гостей", "Еда", "Аллергии", "Напитки", "Комментарий", "Когда"];
  const lines = [
    header,
    ...rows.map((item) => [
      item.name,
      item.attending === "yes" ? "да" : "нет",
      String(item.guests),
      item.food,
      item.allergies,
      item.drinks.join(", "),
      item.comment,
      item.updatedAt,
    ]),
  ];
  const body = lines.map((cols) => cols.map((cell) => `"${cell.replace(/"/g, "\"\"")}"`).join(";")).join("\r\n");
  const blob = new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "otvety.csv";
  link.click();
  URL.revokeObjectURL(url);
}
