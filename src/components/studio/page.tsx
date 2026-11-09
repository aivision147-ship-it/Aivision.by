import { Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import {
  clientSteps,
  faqs,
  getTier,
  samples,
  type TierId,
} from "@/data/catalog";
import { briefText, readBriefs, saveBrief, type Brief } from "@/lib/briefs";
import { cn } from "@/lib/cn";
import { mailtoHref, site, whatsappHref } from "@/lib/site";
import { SiteFooter } from "@/components/studio/site-footer";

const formats = [
  { id: "premium", name: "Premium" },
  { id: "luxury", name: "Luxury" },
] as const;

export function StudioPage({ initialTier }: { initialTier?: TierId }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<(typeof formats)[number]["id"]>("premium");
  const [names, setNames] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Brief | null>(null);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previous, setPrevious] = useState<Brief | null>(null);

  useEffect(() => {
    if (initialTier === "velvet") setFormat("premium");
  }, [initialTier]);

  useEffect(() => {
    const saved = readBriefs()[0];
    if (saved) setPrevious(saved);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const company = String(new FormData(event.currentTarget).get("company") ?? "");
    void sendBrief(company);
  }

  async function sendBrief(company: string) {
    const next: Record<string, string> = {};
    if (names.trim().length < 3) next.names = "Напишите оба имени, как на обложке.";
    if (contact.trim().length < 3) next.contact = "Нужен телефон или Telegram, куда ответить.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const brief: Brief = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      names: names.trim(),
      date,
      city: city.trim(),
      guests: "",
      tier: "velvet",
      formatName: format === "luxury" ? "Luxury" : "Premium",
      contact: contact.trim(),
      note: "",
      createdAt: new Date().toISOString(),
    };
    saveBrief(brief);
    setPrevious(brief);
    setCopied(false);
    let delivered = false;
    try {
      const response = await fetch("/send-brief.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          names: brief.names,
          date: brief.date,
          city: brief.city,
          tier: brief.formatName ?? getTier(brief.tier).name,
          contact: brief.contact,
          note: brief.note,
          company,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean } | null;
      delivered = response.ok && payload?.ok === true;
    } catch {
      delivered = false;
    }
    setSent(delivered);
    setDone(brief);
  }

  async function copy(brief: Brief) {
    const text = briefText(brief, brief.formatName ?? getTier(brief.tier).name);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="studio pb-24 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <a href="#top" className="wordmark-gold shrink-0 font-serif text-xl tracking-wide whitespace-nowrap sm:text-2xl" aria-label="AiVISION STUDIO">
            {"AiVISION STUDIO".split("").map((letter, index) =>
              letter === " " ? (
                <span key={index}> </span>
              ) : (
                <span key={index} className="wordmark-letter" style={{ animationDelay: `${index * 0.12}s` }}>
                  {letter}
                </span>
              ),
            )}
          </a>
          <div className="hidden items-center gap-5 md:flex">
            <a href={whatsappHref()} className="inline-flex min-h-11 items-center text-sm text-ink">
              WhatsApp
            </a>
            <a href="#order" className="inline-flex min-h-11 items-center bg-burgundy px-4 text-sm text-cream">
              Оставить заявку
            </a>
          </div>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center md:hidden"
            aria-expanded={open}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        <nav className="hidden border-t border-line md:block">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-x-3 overflow-x-auto px-4 py-2.5 text-sm whitespace-nowrap text-muted">
            <a href="/shablony" className="shrink-0 hover:text-ink">Шаблоны</a>
            <a href="/portfolio" className="shrink-0 hover:text-ink">Работы под ключ</a>
            <a href="/aivision.html" download="aivision.html" className="shrink-0 hover:text-ink">Скачать сайт</a>
            <a href="/o-nas" className="shrink-0 hover:text-ink">О нас</a>
            <a href="/tarify" className="shrink-0 hover:text-ink">Тарифы</a>
            <a href="#services" className="shrink-0 hover:text-ink">Услуги</a>
            <a href="#samples" className="shrink-0 hover:text-ink">Образцы</a>
            <a href="#process" className="shrink-0 hover:text-ink">Как идёт работа</a>
            <a href="#faq" className="shrink-0 hover:text-ink">Вопросы</a>
          </div>
        </nav>
        {open ? (
          <nav className="flex flex-col border-t border-line px-5 py-3 md:hidden">
            {[
              ["/shablony", "Шаблоны"],
              ["/portfolio", "Работы под ключ"],
              ["/o-nas", "О нас"],
              ["/tarify", "Тарифы"],
              ["#services", "Услуги"],
              ["#samples", "Образцы"],
              ["#process", "Как идёт работа"],
              ["#faq", "Вопросы"],
              ["/aivision.html", "Скачать сайт"],
              ["#order", "Оставить заявку"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="flex min-h-12 items-center border-b border-line text-lg font-serif last:border-0"
                download={href.endsWith(".html") ? "aivision.html" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      <main id="top">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "AIVISION STUDIO",
              url: "https://aivision.by/",
              email: site.email,
              telephone: site.phone,
              image: "https://aivision.by/og.jpg",
              priceRange: "0–100+ BYN",
              areaServed: [
                { "@type": "Country", "name": "Беларусь" },
                { "@type": "AdministrativeArea", "name": "Минск" },
                { "@type": "AdministrativeArea", "name": "Брестская область" },
                { "@type": "AdministrativeArea", "name": "Витебская область" },
                { "@type": "AdministrativeArea", "name": "Гомельская область" },
                { "@type": "AdministrativeArea", "name": "Гродненская область" },
                { "@type": "AdministrativeArea", "name": "Минская область" },
                { "@type": "AdministrativeArea", "name": "Могилёвская область" },
              ],
              address: { "@type": "PostalAddress", "addressCountry": "BY" },
              description:
                "Сайт-приглашение на свадьбу: гость открывает ссылку на телефоне и отвечает без приложения.",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            }),
          }}
        />
        <section className="mx-auto grid w-full max-w-6xl items-start gap-10 overflow-x-clip px-5 pt-6 pb-16 md:grid-cols-12 md:pt-10">
          <div className="md:col-span-7">
            <img
              src="/photos/couple.png?v=4"
              alt="Молодая пара смотрит приглашение на телефоне и улыбается"
              className="couple-photo"
            />
            <p className="text-xs tracking-label text-burgundy uppercase">Ателье сайтов-приглашений · вся Беларусь</p>
            <h1 className="mt-4 max-w-2xl font-serif text-4xl text-ink md:text-5xl">
              Сайт-приглашение на свадьбу
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              Это электронное приглашение на свадьбу: ссылка в Telegram, Viber или WhatsApp, без приложения.
              Гость открывает ссылку на телефоне, и открывается Ваш уникальный сайт, где указаны: имена,
              дата, место, расписание дня, Ваши пожелания, дресс-код и ещё много полезной информации,
              которую Вы хотите донести, а также блок, который заполняют приглашённые. Их ответ Вы
              увидите у себя. Таким образом Ваша страница будет собрана под Вашу свадьбу, а не под
              общий шаблон.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/shablony" className="inline-flex min-h-11 items-center bg-burgundy px-4 text-sm text-cream">Выбрать дизайн</a>
              <a href="/brief" className="inline-flex min-h-11 items-center border border-line px-4 text-sm">Заказать под ключ</a>
            </div>
            <p className="mt-3 text-sm text-muted">Бесплатно до публикации — платите, только когда понравится. Эконом по-прежнему картинка за 0 BYN.</p>
          </div>
          <div className="phone-photo md:col-span-5">
            <img src="/photos/iphone.png" alt="iPhone с сайтом-приглашением на весь экран" />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-16" id="services">
          <h2 className="text-center font-serif text-5xl md:whitespace-nowrap">Два способа изготовить приглашение</h2>
          <div className="mt-8 grid items-stretch gap-4 md:grid-cols-2">
            <article id="self" className="scroll-mt-24 flex flex-col border border-line bg-cream p-6 md:p-8">
              <p className="text-xs tracking-label text-burgundy uppercase">Конструктор</p>
              <h3 className="mt-2 font-serif text-4xl">Собрать самому</h3>
              <dl className="mt-6 divide-y divide-line border-y border-line">
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt>
                    <Link to="/economy" className="font-serif text-2xl hover:opacity-80">
                      Economy
                    </Link>
                  </dt>
                  <dd className="text-sm text-ink">0 BYN</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt>
                    <Link to="/middle" className="font-serif text-2xl text-burgundy hover:opacity-80">
                      Middle
                    </Link>
                  </dt>
                  <dd className="text-sm text-ink">45 BYN</dd>
                </div>
              </dl>
              <p className="mt-5 text-sm leading-relaxed text-muted">
                Готовый образец, без ожидания дизайнера. Заполняете поля сами и в тот же день отправляете
                приглашение гостям.
              </p>
            </article>
            <article id="custom" className="scroll-mt-24 flex flex-col border border-line bg-paper p-6 md:p-8">
              <p className="text-xs tracking-label text-burgundy uppercase">Ателье</p>
              <h3 className="mt-2 font-serif text-4xl">Сделать с нами</h3>
              <dl className="mt-6 divide-y divide-line border-y border-line">
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt>
                    <Link to="/" hash="order" className="metal metal-silver font-serif text-2xl">
                      Premium
                    </Link>
                  </dt>
                  <dd className="text-sm text-ink">85 BYN</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt>
                    <Link to="/" hash="order" className="metal metal-gold font-serif text-2xl">
                      Luxury
                    </Link>
                  </dt>
                  <dd className="text-right text-sm text-ink">от 100 BYN по согласованию от сложности</dd>
                </div>
              </dl>
              <p className="mt-5 text-sm leading-relaxed text-muted">
                После заявки мы связываемся и собираем страницу под вашу свадьбу, а не под общий шаблон.
                Изготовление 3–10 дней от предоплаты 50%. Вторые 50% — когда откроете ссылку на своём
                телефоне и примете страницу.
              </p>
            </article>
          </div>
        </section>

        <section className="scroll-mt-28 bg-cream py-16" id="samples">
          <div className="mx-auto w-full max-w-6xl px-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="text-center">
                <p className="text-xs tracking-label text-burgundy uppercase">Каталог</p>
                <h2 className="mt-2 font-serif text-5xl">Образцы на ваш выбор</h2>
                <p className="mt-3 w-full text-left text-muted">
                  Нажмите на карточку тарифа. Economy и Middle можно собрать сразу. Premium и Luxury
                  откроют заявку: страницу сделаем мы, под вашу свадьбу.
                </p>
              </div>
            </div>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2">
                {samples.map((sample, index) =>
                  index === 2 || index === 3 ? null : (
                  <li key={sample.slug}>
                    {index === 0 ? (
                      <Link to="/economy" className="group flex h-full flex-col border border-line bg-paper">
                        <div className="relative aspect-3/2 overflow-hidden">
                          <img src="/photos/peony.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-[#faf5f3]/45" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-ink">
                            <p className="text-[10px] tracking-[0.22em] text-burgundy uppercase">Приглашение</p>
                            <p className="mt-2 font-serif text-3xl leading-none">Софья и Марк</p>
                            <div className="my-2 h-px w-8 bg-burgundy" />
                            <p className="font-serif text-sm">12 июня 2027</p>
                            <p className="mt-1 text-[11px] text-muted">суббота, 15:00</p>
                            <p className="mt-2 font-serif text-sm">Усадьба «Лошица»</p>
                            <p className="mt-1 text-[11px] text-muted">Минск, Лошицкий парк</p>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                          <p className="text-xs tracking-label text-muted uppercase">Собрать самому</p>
                          <h3 className="mt-3 font-serif text-5xl">Economy</h3>
                          <p className="mt-2 font-serif text-2xl">0 BYN</p>
                          <p className="mt-6 inline-flex items-center gap-1 text-sm text-burgundy">
                            Собрать карточку
                            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                          </p>
                        </div>
                      </Link>
                    ) : index === 1 ? (
                      <Link to="/middle" className="group flex h-full flex-col border border-line bg-paper">
                        <img src={sample.cover} alt="" className="aspect-3/2 w-full object-cover" />
                        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                          <p className="text-xs tracking-label text-muted uppercase">Собрать самому</p>
                          <h3 className="mt-3 font-serif text-5xl text-burgundy">Middle</h3>
                          <p className="mt-2 font-serif text-2xl">45 BYN</p>
                          <p className="mt-6 inline-flex items-center gap-1 text-sm text-burgundy">
                            Собрать сайт
                            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                          </p>
                        </div>
                      </Link>
                    ) : index === 4 ? (
                      <Link to="/" hash="order" className="group flex h-full flex-col border border-line bg-paper">
                        <img src={sample.cover} alt="" className="aspect-3/2 w-full object-cover" />
                        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                          <p className="text-xs tracking-label text-muted uppercase">Просмотреть и оставить заявку</p>
                          <h3 className="metal metal-silver mt-3 font-serif text-5xl">Premium</h3>
                          <p className="metal metal-silver mt-2 font-serif text-2xl">85 BYN</p>
                          <p className="mt-6 inline-flex items-center gap-1 text-sm text-burgundy">
                            Оставить заявку
                            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <Link to="/" hash="order" className="group flex h-full flex-col border border-line bg-paper">
                        <img src={sample.cover} alt="" className="aspect-3/2 w-full object-cover" />
                        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                          <p className="text-xs tracking-label text-muted uppercase">Просмотреть и оставить заявку</p>
                          <h3 className="metal metal-gold metal-late mt-3 font-serif text-5xl">Luxury</h3>
                          <p className="metal metal-gold metal-late mt-2 font-serif text-2xl">от 100 BYN</p>
                          <p className="mt-6 inline-flex items-center gap-1 text-sm text-burgundy">
                            Оставить заявку
                            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                          </p>
                        </div>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
          </div>
        </section>

        <section className="border-y border-line bg-paper" id="tariffs">
          <div className="mx-auto w-full max-w-6xl px-5 py-16">
            <h2 className="text-center font-serif text-5xl">Тарифы</h2>
            <p className="mt-3 w-full text-center text-sm text-muted">
              Чем выше тариф, тем меньше вопросов остаётся гостям и тем меньше вам приходится объяснять в чате.
            </p>
            <div className="mt-8 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
              {[
                {
                  name: "Economy",
                  price: "0 BYN",
                  how: "Собрать самому",
                  cta: "Собрать карточку",
                  href: "/economy",
                  items: [
                    "Без домена и без ожидания: скачиваете картинку и сразу отправляете гостям",
                    "Готовый фон из образца — ничего не нужно рисовать",
                    "Имена пары на обложке",
                    "Дата, чтобы её не переспрашивали",
                    "Место сбора",
                    "Контакты для связи у каждого гостя под рукой",
                  ],
                },
                {
                  name: "Middle",
                  price: "45 BYN",
                  how: "Собрать самому",
                  cta: "Собрать свой сайт",
                  href: "/middle",
                  tone: "text-burgundy",
                  items: [
                    "Гости открывают не картинку, а ваш сайт, например ivanov.aivision.by",
                    "39 готовых образцов: девять авторских и каталог из тридцати стилей",
                    "Фон из образца, собранный под вашу пару",
                    "Имена, дата и место — крупно, с телефона",
                    "Программа дня, чтобы не отвечать «а во сколько?»",
                    "Таймер до дня свадьбы: гости видят, сколько осталось",
                    "Кнопка «Открыть на карте», чтобы не спрашивать адрес в чате",
                    "Дресс-код одной фразой, чтобы не прийти не в том",
                    "Ваши слова гостям",
                    "Пожелания по подаркам, чтобы не получать десятый одинаковый",
                    "Ссылки в мессенджеры: гость пишет вам в один тап",
                    "Анкета: ответы сами приходят в ваш мессенджер или на почту",
                    "Сайт работает до дня свадьбы и ещё месяц после неё",
                  ],
                },
                {
                  name: "Premium",
                  price: "85 BYN",
                  how: "Сделать с нами",
                  cta: "Заказать Premium",
                  href: "/zakaz?tier=premium",
                  tone: "metal metal-silver",
                  items: [
                    "Всё, что есть в Middle, а страницу собираем мы",
                    "Фон изменим под вас, если образец почти ваш, но не до конца",
                    "Фото пары и свидетелей: гости видят лица, не только имена",
                    "Музыка встречает гостя, когда он открывает приглашение",
                    "Ответы гостей собираются на вашем сайте по разделам — почта и мессенджеры не нужны",
                    "Фотогалерея пары",
                    "После свадьбы гости сами присылают кадры в вашу галерею",
                    "Чат с пожеланиями, который остаётся вам",
                    "Ссылка работает 6 месяцев с дня покупки",
                  ],
                },
                {
                  name: "Luxury",
                  price: "от 100 BYN",
                  how: "Сделать с нами",
                  cta: "Собрать индивидуальный",
                  href: "/zakaz?tier=luxury",
                  tone: "metal metal-gold",
                  items: [
                    "Всё из Middle и Premium",
                    "Видео пары и анимация: приглашение открывается как короткий фильм",
                    "Ваши фото и видео становятся подложкой, а не чужой фон из образца",
                    "Дизайн согласуем, пока страница не станет только вашей",
                    "Ссылка работает 12 месяцев с дня покупки",
                  ],
                },
              ].map((tariff) => (
                <article key={tariff.name} className="flex w-64 shrink-0 flex-col border border-line bg-cream p-4 md:w-auto md:min-h-[32rem] md:p-5">
                  <p className="text-xs tracking-label text-burgundy uppercase">{tariff.how}</p>
                  <h3 className={`mt-3 font-serif text-3xl md:text-4xl ${"tone" in tariff ? tariff.tone : ""}`}>{tariff.name}</h3>
                  <p className={`mt-4 font-serif text-xl leading-none md:text-2xl ${tariff.name === "Middle" ? "text-ink" : "tone" in tariff ? tariff.tone : "text-ink"}`}>{tariff.price}</p>
                  <ul className="mt-6 space-y-2 text-sm text-ink">
                    {tariff.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <a
                      href={tariff.href}
                      className={`btn-float inline-flex min-h-12 w-full items-center justify-center px-3 text-center text-sm leading-tight ${
                        tariff.name === "Premium"
                          ? "metal-btn metal-btn-silver"
                          : tariff.name === "Luxury"
                            ? "metal-btn metal-btn-gold"
                            : tariff.name === "Middle"
                              ? "bg-burgundy text-cream"
                              : "border border-line bg-cream text-ink"
                      }`}
                    >
                      {tariff.cta}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-x-clip bg-paper" id="includes">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-5xl">Гость открывает ссылку и больше не пишет вам в чат</h2>
              <p className="mt-4 text-lg text-ink-soft">
                На весь экран телефона, без приложения. Имена, дата, место и то, что вы хотите им сказать.
                Чем выше тариф, тем меньше вопросов остаётся: программа, дресс-код, подарки, фото и ответ,
                который приходит вам, а не теряется в переписке.
              </p>
            </div>
            <img
              src="/photos/still.jpg"
              alt="Конверт, пыльная роза и свеча на льняном столе"
              className="still-photo"
            />
          </div>
        </section>

        <section className="scroll-mt-28 mx-auto w-full max-w-6xl px-5 py-16" id="process">
          <h2 className="text-center font-serif text-5xl">Как идёт работа</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {clientSteps.map((step) => (
              <li key={step.n}>
                <p className="font-serif text-3xl text-burgundy">{step.n}</p>
                <h3 className="mt-2 font-serif text-3xl">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="scroll-mt-28 border-t border-line" id="faq">
          <div className="mx-auto w-full max-w-3xl px-5 py-16">
            <h2 className="font-serif text-5xl">Вопросы</h2>
            <div className="mt-6">
              {faqs.map((item) => (
                <details key={item.q} className="group border-b border-line">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-serif text-2xl">
                    {item.q}
                    <ChevronDown className="size-5 shrink-0 transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="pb-5 text-sm text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="scroll-mt-28 bg-burgundy-deep text-cream" id="order">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-5xl text-cream">Оставить заявку</h2>
              <p className="mt-4 text-sm text-cream/75">
                Заявка уходит на {site.email}. Если удобнее написать сразу, откройте WhatsApp{" "}
                {site.whatsappDisplay}. Если до свадьбы меньше трёх недель, напишите это в WhatsApp.
              </p>
              <div className="mt-5 flex flex-col gap-2 text-sm">
                <a className="min-h-11 underline" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                <a className="min-h-11 underline" href={whatsappHref()}>
                  WhatsApp {site.whatsappDisplay}
                </a>
              </div>
              {previous && !done ? (
                <p className="mt-4 text-sm text-cream/70">
                  На устройстве уже есть заявка: {previous.names}, формат «{previous.formatName ?? getTier(previous.tier).name}».
                </p>
              ) : null}
            </div>
            {done ? (
              <div className="bg-cream p-5 text-ink">
                <p className="font-serif text-4xl">{sent ? "Заявка отправлена" : "Заявка готова"}</p>
                <p className="mt-2 text-sm text-muted">
                  {sent
                    ? `Письмо ушло на ${site.email}.`
                    : `С этой страницы письмо не ушло. На ${site.origin.replace("https://", "")} оно приходит на ${site.email}. Сейчас текст можно отправить письмом или в WhatsApp.`}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {done.names} · {done.formatName ?? getTier(done.tier).name} · {done.contact}
                </p>
                <div className="mt-4 grid gap-2">
                  <a
                    className="inline-flex min-h-12 items-center justify-center bg-burgundy text-sm text-cream"
                    href={mailtoHref("Заявка с aivision.by", briefText(done, done.formatName ?? getTier(done.tier).name))}
                  >
                    Открыть письмо на {site.email}
                  </a>
                  <a
                    className="inline-flex min-h-12 items-center justify-center bg-burgundy text-sm text-cream"
                    href={whatsappHref(briefText(done, done.formatName ?? getTier(done.tier).name))}
                  >
                    Написать в WhatsApp
                  </a>
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center border border-line text-sm"
                    onClick={() => void copy(done)}
                  >
                    {copied ? "Скопировано" : "Скопировать текст"}
                  </button>
                </div>
                <button
                  type="button"
                  className="mt-2 min-h-11 w-full text-sm text-muted"
                  onClick={() => setDone(null)}
                >
                  Изменить заявку
                </button>
              </div>
            ) : (
              <form className="space-y-3" onSubmit={submit}>
                <Field label="Имена" error={errors.names}>
                  <input
                    className="studio-input"
                    value={names}
                    onChange={(event) => setNames(event.target.value)}
                    placeholder="Аня и Лев"
                    autoComplete="name"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Дата">
                    <input
                      className="studio-input"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                    />
                  </Field>
                  <Field label="Город">
                    <input
                      className="studio-input"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder="Любой город Беларуси"
                    />
                  </Field>
                </div>
                <Field label="Формат">
                  <div className="grid grid-cols-2 gap-2">
                    {formats.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={cn(
                          "min-h-12 border text-sm",
                          format === item.id ? "border-burgundy bg-burgundy text-cream" : "border-line bg-cream text-ink",
                        )}
                        onClick={() => setFormat(item.id)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Куда ответить" error={errors.contact}>
                  <input
                    className="studio-input"
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder="Telegram или телефон"
                    autoComplete="tel"
                  />
                </Field>
                <button type="submit" className="min-h-12 w-full bg-burgundy text-sm text-cream">
                  Отправить заявку
                </button>
                <input className="hidden" tabIndex={-1} autoComplete="off" name="company" defaultValue="" />
              </form>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 py-3 safe-dock md:hidden">
        <a href="#order" className="flex min-h-12 items-center justify-center bg-burgundy text-sm text-cream">
          Оставить заявку
        </a>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm text-ink">
      <span className="mb-1 block text-muted">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-burgundy">{error}</span> : null}
    </label>
  );
}
