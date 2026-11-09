import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, MapPin, Music } from "lucide-react";
import {
  complexityName,
  getTier,
  type Sample,
} from "@/data/catalog";
import { site, whatsappHref } from "@/lib/site";

const meals = ["Мясо", "Рыба", "Овощи"];
const gifts = [
  { title: "Ночь в этом саду", note: "Без сервиза и лент" },
  { title: "Ужин через год", note: "Не конверт — бронь стола" },
  { title: "Пластинка на первый танец", note: "Если она правда ваша" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function useCountdown(iso: string, on: boolean) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!on) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [iso, on]);

  return useMemo(() => {
    if (now === null) return null;
    const diff = Math.max(0, new Date(iso).getTime() - now);
    const total = Math.floor(diff / 1000);
    return {
      days: Math.floor(total / 86400),
      hours: pad(Math.floor((total % 86400) / 3600)),
      minutes: pad(Math.floor((total % 3600) / 60)),
      seconds: pad(total % 60),
    };
  }, [iso, now]);
}

export function InviteExperience({ sample, embed = false }: { sample: Sample; embed?: boolean }) {
  const tier = getTier(sample.tier);
  const [opened, setOpened] = useState(!sample.unlock);
  const [music, setMusic] = useState(false);
  const [savedGifts, setSavedGifts] = useState<string[]>([]);
  const [coming, setComing] = useState<"yes" | "no" | null>(null);
  const [meal, setMeal] = useState<string | null>(null);
  const [transfer, setTransfer] = useState<string | null>(null);
  const [arrival, setArrival] = useState<string | null>(null);
  const [guest, setGuest] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const countdown = useCountdown(sample.iso, sample.countdown && opened);

  const mapHref = `https://yandex.ru/maps/?text=${encodeURIComponent(sample.address)}`;

  if (!opened) {
    return (
      <Shell sample={sample} embed={embed}>
        <section className="screen-fit relative">
          <img
            src={sample.cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/55" />
          <div className="dock-pad relative flex h-full flex-col justify-end px-6 pt-16 text-cream">
            <p className="text-xs tracking-label uppercase">Приглашение закрыто</p>
            <h1 className="mt-4 font-serif text-6xl leading-none text-cream">
              {sample.names[0]}
              <span className="mt-1 block italic text-cream/80">и {sample.names[1]}</span>
            </h1>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/80">{sample.greeting}</p>
            <button
              type="button"
              className="mt-8 inline-flex min-h-12 items-center justify-center bg-cream px-6 text-sm font-medium text-ink"
              onClick={() => setOpened(true)}
            >
              Открыть приглашение
            </button>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell sample={sample} embed={embed}>
      <article className={`iv iv-${sample.theme} rise ${embed ? "" : "dock-pad"}`}>
        <Cover sample={sample} />

        {sample.countdown && countdown ? (
          <section className="mx-auto grid max-w-md grid-cols-4 gap-2 px-6 py-8 text-center">
            <Count label="дни" value={countdown ? String(countdown.days) : "—"} />
            <Count label="часы" value={countdown?.hours ?? "—"} />
            <Count label="мин" value={countdown?.minutes ?? "—"} />
            <Count label="сек" value={countdown?.seconds ?? "—"} />
          </section>
        ) : null}

        {sample.theme === "night" ? (
          <section className="mx-auto flex max-w-md items-center justify-between gap-4 px-6 pb-4">
            <div>
              <p className="text-xs tracking-label uppercase invite-muted">Музыка</p>
              <p className="mt-1 text-sm invite-muted">
                {music
                  ? "В готовом сайте здесь ваш трек. Автозапуск на Android выключен специально."
                  : "Гость включает звук сам — телефон не даст сайту заиграть без касания."}
              </p>
            </div>
            <button
              type="button"
              aria-pressed={music}
              onClick={() => setMusic((value) => !value)}
              className="invite-fill inline-flex size-12 shrink-0 items-center justify-center"
            >
              {music ? (
                <span className="bars flex h-4 items-end gap-0.5" aria-hidden>
                  <span className="block h-4 w-0.5 bg-current" />
                  <span className="block h-4 w-0.5 bg-current" />
                  <span className="block h-4 w-0.5 bg-current" />
                </span>
              ) : (
                <Music className="size-4" aria-hidden />
              )}
              <span className="sr-only">{music ? "Выключить музыку" : "Включить музыку"}</span>
            </button>
          </section>
        ) : null}

        {sample.story ? (
          <section className="mx-auto max-w-md px-6 py-8">
            <p className="font-serif text-3xl leading-tight">{sample.greeting}</p>
            <p className="mt-4 text-sm leading-relaxed invite-muted">{sample.story}</p>
          </section>
        ) : (
          <section className="mx-auto max-w-md px-6 py-8">
            <p className="font-serif text-3xl leading-tight">{sample.greeting}</p>
          </section>
        )}

        <section className="mx-auto max-w-md space-y-4 px-6 py-4">
          <Fact label="Когда" value={sample.dateLabel} />
          <Fact label="Где" value={`${sample.venue}, ${sample.city}`} />
          <a
            href={mapHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-sm underline decoration-1 underline-offset-4"
          >
            <MapPin className="size-4" aria-hidden />
            Маршрут: {sample.address}
          </a>
        </section>

        {sample.program.length > 0 ? (
          <section className="mx-auto max-w-md px-6 py-8">
            <h2 className="font-serif text-4xl">День</h2>
            <ol className="mt-6 space-y-5 border-l border-(--i-line) pl-5">
              {sample.program.map((item) => (
                <li key={item.time} className="relative">
                  <span className="absolute top-1.5 -left-6 size-2 rounded-full bg-(--i-accent)" />
                  <p className="text-xs tracking-label uppercase invite-muted">{item.time}</p>
                  <p className="mt-1 font-serif text-2xl">{item.title}</p>
                  <p className="text-sm invite-muted">{item.note}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {sample.weekend.length > 0 ? (
          <section className="mx-auto grid max-w-md gap-3 px-6 py-4">
            {sample.weekend.map((day) => (
              <article key={day.day} className="invite-card border border-(--i-line) p-4">
                <p className="text-xs tracking-label uppercase invite-accent">{day.day}</p>
                <h3 className="mt-1 font-serif text-2xl">{day.title}</h3>
                <p className="text-sm invite-muted">{day.note}</p>
              </article>
            ))}
          </section>
        ) : null}

        {sample.travel ? (
          <section className="mx-auto max-w-md space-y-3 px-6 py-6">
            <h2 className="font-serif text-4xl">Как добраться</h2>
            {[
              ["Самолёт", "Аэропорт Симферополь. Дальше около полутора часов на машине вдоль моря."],
              ["Отель", "«Тихая бухта», блок из двенадцати номеров держим до 1 августа."],
              ["Трансфер", "В субботу в 15:30 от отеля одна машина. В анкете отметьте, нужны ли вы в ней."],
            ].map(([title, note]) => (
              <article key={title} className="border-t border-(--i-line) pt-3">
                <h3 className="font-serif text-2xl">{title}</h3>
                <p className="text-sm invite-muted">{note}</p>
              </article>
            ))}
          </section>
        ) : null}

        <Gallery sample={sample} />

        <section className="mx-auto max-w-md px-6 py-8">
          <h2 className="font-serif text-4xl">Во что</h2>
          <p className="mt-3 font-serif text-2xl leading-snug">{sample.dress}</p>
          <p className="mt-2 text-sm invite-muted">{sample.dressNote}</p>
          {sample.theme === "sea" ? (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="border border-(--i-line) p-3">
                <p className="text-xs tracking-label uppercase invite-muted">Пятница</p>
                <p className="mt-1">Светлый лён, можно босиком</p>
              </div>
              <div className="border border-(--i-line) p-3">
                <p className="text-xs tracking-label uppercase invite-muted">Суббота</p>
                <p className="mt-1">Спокойнее и теплее к вечеру</p>
              </div>
            </div>
          ) : null}
        </section>

        {sample.wishlist ? (
          <section className="mx-auto max-w-md px-6 py-4">
            <h2 className="font-serif text-4xl">Если хотите подарить</h2>
            <ul className="mt-4 space-y-2">
              {gifts.map((gift) => {
                const on = savedGifts.includes(gift.title);
                return (
                  <li key={gift.title}>
                    <button
                      type="button"
                      className="iv-choice w-full"
                      data-on={on}
                      onClick={() =>
                        setSavedGifts((list) =>
                          on ? list.filter((item) => item !== gift.title) : [...list, gift.title],
                        )
                      }
                    >
                      <span className="block font-medium">{gift.title}</span>
                      <span className="block text-sm opacity-80">{gift.note}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="mx-auto max-w-md px-6 py-10">
          <h2 className="font-serif text-4xl">Вы будете?</h2>
          <p className="mt-2 text-sm invite-muted">
            В образце ответ никуда не уходит. В заказе пара видит его сразу, без регистрации гостя.
          </p>
          {sent ? (
            <div className="invite-card mt-6 border border-(--i-line) p-5">
              <p className="font-serif text-3xl">
                {coming === "no" ? "Жаль. Мы сохранили отказ." : "Ждём вас."}
              </p>
              <p className="mt-2 text-sm invite-muted">
                {guest ? `${guest}, ` : ""}
                это демонстрация анкеты уровня «{tier.name}».
                {meal ? ` Еда: ${meal.toLowerCase()}.` : ""}
                {transfer ? ` Трансфер: ${transfer.toLowerCase()}.` : ""}
                {arrival ? ` Приезд: ${arrival.toLowerCase()}.` : ""}
              </p>
              <button type="button" className="mt-4 text-sm underline" onClick={() => setSent(false)}>
                Изменить ответ
              </button>
            </div>
          ) : (
            <form
              className="mt-6 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!coming) return;
                setSent(true);
              }}
            >
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="iv-choice" data-on={coming === "yes"} onClick={() => setComing("yes")}>
                  Приду
                </button>
                <button type="button" className="iv-choice" data-on={coming === "no"} onClick={() => setComing("no")}>
                  Не смогу
                </button>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block invite-muted">Имя</span>
                <input
                  className="iv-input"
                  value={guest}
                  onChange={(event) => setGuest(event.target.value)}
                  placeholder="Как к вам обращаться"
                  autoComplete="name"
                />
              </label>
              {sample.rsvp !== "simple" && coming !== "no" ? (
                <fieldset>
                  <legend className="mb-2 text-sm invite-muted">Еда</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {meals.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="iv-choice text-center"
                        data-on={meal === item}
                        onClick={() => setMeal(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : null}
              {(sample.rsvp === "full" || sample.rsvp === "weekend") && coming !== "no" ? (
                <fieldset>
                  <legend className="mb-2 text-sm invite-muted">Трансфер</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {["Нужен", "Доеду сам"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="iv-choice text-center"
                        data-on={transfer === item}
                        onClick={() => setTransfer(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : null}
              {sample.rsvp === "weekend" && coming !== "no" ? (
                <fieldset>
                  <legend className="mb-2 text-sm invite-muted">Когда будете</legend>
                  <div className="grid gap-2">
                    {["С пятницы", "Только суббота", "Суббота и завтрак"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="iv-choice"
                        data-on={arrival === item}
                        onClick={() => setArrival(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : null}
              {sample.rsvp !== "simple" ? (
                <label className="block text-sm">
                  <span className="mb-1 block invite-muted">Комментарий</span>
                  <textarea
                    className="iv-input min-h-24"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Дети, аллергия, песня"
                  />
                </label>
              ) : null}
              <button
                type="submit"
                disabled={!coming}
                className="invite-fill min-h-12 w-full text-sm font-medium disabled:opacity-40"
              >
                Ответить
              </button>
            </form>
          )}
        </section>

        {embed ? null : (
          <footer className="mx-auto max-w-md space-y-3 px-6 pb-8 text-xs invite-muted">
            <p>
              Образец «{sample.title}» · {complexityName[sample.complexity].toLowerCase()} сложность · имена
              выдуманы, чтобы показать масштаб, а не чужую свадьбу.
            </p>
            <p className="flex flex-col gap-2 text-sm">
              <a className="underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              <a className="underline" href={whatsappHref()}>
                WhatsApp {site.whatsappDisplay}
              </a>
              <a className="underline" href="/">
                На главную aivision.by
              </a>
            </p>
          </footer>
        )}
      </article>
    </Shell>
  );
}

function Shell({
  sample,
  embed = false,
  children,
}: {
  sample: Sample;
  embed?: boolean;
  children: ReactNode;
}) {
  const tier = getTier(sample.tier);
  return (
    <div className={embed ? "min-h-dvh bg-paper" : "min-h-dvh bg-paper"}>
      {embed ? null : (
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="inline-flex min-h-11 items-center gap-1 text-sm text-ink">
            <ArrowLeft className="size-4" aria-hidden />
            Ателье
          </Link>
          <p className="text-right text-xs text-muted">{tier.name}</p>
        </div>
      )}
      <div className={embed ? "mx-auto w-full max-w-md" : "mx-auto w-full max-w-md md:border md:border-line"}>
        {children}
      </div>
      {embed ? null : (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 safe-dock">
          <Link
            to="/"
            search={{ tier: sample.tier }}
            hash="order"
            className="flex min-h-12 items-center justify-between gap-3 bg-burgundy px-4 text-sm text-cream"
          >
            <span>Хочу «{sample.title}»</span>
            <span>Оставить заявку</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function Cover({ sample }: { sample: Sample }) {
  if (sample.theme === "ivory") {
    return (
      <header className="px-6 pt-10">
        <p className="text-xs tracking-label uppercase invite-muted">{sample.dateLabel}</p>
        <h1 className="mt-6 font-serif text-6xl leading-none">
          {sample.names[0]}
          <span className="mt-2 block text-5xl italic invite-accent">и {sample.names[1]}</span>
        </h1>
        <img
          src={sample.photos[0]}
          alt="Светлый неф капеллы без гостей"
          className="mt-8 aspect-3/4 w-full object-cover"
        />
      </header>
    );
  }

  if (sample.theme === "editorial") {
    return (
      <header className="px-6 pt-12">
        <p className="text-xs tracking-label uppercase invite-accent">{sample.city}</p>
        <h1 className="mt-6 font-serif text-6xl uppercase leading-none tracking-wide">
          {sample.names[0]}
          <span className="mt-2 block text-4xl italic normal-case tracking-normal invite-muted">
            {sample.names[1]}
          </span>
        </h1>
        <p className="mt-6 text-sm tracking-label uppercase">{sample.dateLabel}</p>
        <img src={sample.cover} alt="Свечной стол в тёмном зале" className="mt-8 aspect-3/2 w-full object-cover" />
      </header>
    );
  }

  if (sample.theme === "polaroid") {
    return (
      <header className="px-6 pt-8">
        <p className="text-center text-xs tracking-label uppercase invite-muted">{sample.city}</p>
        <h1 className="mt-3 text-center font-serif text-5xl italic leading-none">
          {sample.names[0]} и {sample.names[1]}
        </h1>
        <p className="mt-3 text-center text-sm invite-muted">{sample.dateLabel}</p>
      </header>
    );
  }

  return (
    <header className="cover-h relative">
      <img
        src={sample.cover}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/10 to-transparent" />
      <div className="cover-h relative flex flex-col justify-end px-6 pt-16 pb-8 text-cream">
        <p className="text-xs tracking-label uppercase text-cream/80">{sample.dateLabel}</p>
        <h1 className="mt-3 font-serif text-6xl leading-none text-cream">
          {sample.names[0]}
          <span className="block italic">и {sample.names[1]}</span>
        </h1>
        <p className="mt-3 text-sm text-cream/80">
          {sample.venue}
        </p>
      </div>
    </header>
  );
}

function Gallery({ sample }: { sample: Sample }) {
  if (sample.gallery === "none" || sample.gallery === "one") return null;
  if (sample.gallery === "duo") {
    return (
      <section className="mx-auto grid max-w-md grid-cols-2 gap-2 px-6 py-4">
        {sample.photos.map((src) => (
          <img key={src} src={src} alt="" className="aspect-3/4 w-full object-cover" />
        ))}
      </section>
    );
  }
  if (sample.gallery === "polaroid") {
    return (
      <section className="mx-auto max-w-md space-y-6 overflow-hidden px-8 py-8">
        {sample.photos.map((src, index) => (
          <figure
            key={src}
            className="invite-card p-3 pb-8 shadow-sm"
            style={{ transform: `rotate(${index % 2 === 0 ? -1.5 : 1.5}deg)` }}
          >
            <img src={src} alt="" className="aspect-square w-full object-cover" />
          </figure>
        ))}
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-md space-y-3 px-6 py-4">
      {sample.photos.map((src) => (
        <img key={src} src={src} alt="" className="aspect-3/2 w-full object-cover" />
      ))}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-(--i-line) pt-3">
      <p className="text-xs tracking-label uppercase invite-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl leading-snug">{value}</p>
    </div>
  );
}

function Count({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-(--i-line) px-1 py-3">
      <p className="font-serif text-3xl tabular-nums">{value}</p>
      <p className="text-xs tracking-label uppercase invite-muted">{label}</p>
    </div>
  );
}
