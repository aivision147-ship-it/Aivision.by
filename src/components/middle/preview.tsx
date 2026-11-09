import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { inviteBackgrounds } from "@/data/backgrounds";
import { blockVisible, fontPairs, frames, photoFilterCss, teamRoles, textureUrl, type BuilderState } from "@/data/constructor-options";
import { palettes } from "@/lib/palette";

type FramesApi = {
  injectCSS: () => void;
  render: (element: HTMLElement, id: string) => void;
  dividerSVG: (id: string) => string;
  markSVG: (id: string) => string;
  FRAMES: { id: string; divider: string; mark: string }[];
};

declare global {
  interface Window {
    WeddingFrames?: FramesApi;
  }
}

function plural(value: number, one: string, few: string, many: string) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function useCountdown(date: string, time: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  if (!date) return null;
  const target = new Date(`${date}T${time || "15:00"}:00+03:00`).getTime();
  if (Number.isNaN(target)) return null;
  const left = target - now;
  if (left <= 0) return { done: true, days: 0, hours: 0, minutes: 0 };
  return { done: false, days: Math.floor(left / 86400000), hours: Math.floor(left / 3600000) % 24, minutes: Math.floor(left / 60000) % 60 };
}

export function InvitePreview({ state, desktop }: { state: BuilderState; desktop: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const [ornament, setOrnament] = useState({ divider: "", mark: "" });
  const strength = state.design.texture === "none" ? 0 : state.design.strength;
  const palette = useMemo(() => palettes(state.design.color, strength), [state.design.color, strength]);
  const variant = palette.list.find((item) => item.id === state.design.variant) ?? palette.list[2];
  const pair = fontPairs.find((item) => item.id === state.design.pair) ?? fontPairs[0];
  const frame = frames.find((item) => item.id === state.design.frame) ?? frames[3];
  const ready = inviteBackgrounds.find((item) => item.id === state.design.backgroundId);
  const countdown = useCountdown(state.date, state.time);
  const names = [state.partner1 || "Имя", state.partner2 || "Имя"];
  const long = names.join(" ").length > 22;
  const nameSize = (desktop ? pair.nameDesktop : pair.nameMobile) * state.design.nameK * (long ? 0.78 : 1);
  const bodySize = (desktop ? pair.bodyDesktop : pair.bodyMobile) * state.design.bodyK;
  const picture = state.design.ownBackground || (ready ? ready.mobile : "");
  const visible = ["welcome", "story", "program", "place", "dress", "gifts", "timer", "contacts", "rsvp", "team", "final"].filter((key) => blockVisible(state, key));

  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      const api = window.WeddingFrames;
      const root = rootRef.current;
      if (!api || !root || cancelled) return;
      api.injectCSS();
      root.querySelectorAll<HTMLElement>("[data-frame-host]").forEach((element) => {
        api.render(element, element.dataset.frameHost || "none");
      });
      const dividerId = frame.divider;
      const markId = frame.mark;
      setOrnament({
        divider: state.design.frameOn ? api.dividerSVG(dividerId) : "",
        mark: state.design.frameOn ? api.markSVG(markId) : "",
      });
    };
    if (window.WeddingFrames) draw();
    else {
      const script = document.createElement("script");
      script.src = "/frames/frames.js";
      script.onload = draw;
      document.body.appendChild(script);
    }
    return () => {
      cancelled = true;
    };
  }, [frame.divider, frame.mark, state.design.frame, state.design.frameOn, state.design.where, state.design.stroke, state.design.inset, state.design.scale, state.design.opacity, visible.join("|"), desktop]);

  const style = {
    "--bg": palette.bg,
    "--bg2": palette.bg,
    "--text": variant.text,
    "--head": variant.head,
    "--frame-color": variant.frame,
    "--accent-color": variant.accent,
    "--btn": variant.btn,
    "--btn-text": variant.btnText,
    "--frame-stroke": `${state.design.stroke}px`,
    "--frame-opacity": state.design.opacity,
    "--frame-inset": `${state.design.inset}px`,
    "--frame-scale": state.design.scale,
    "--name-font": state.design.ownFont ? "AivOwn" : pair.script,
    "--body-font": pair.body,
    "--name-size": `${nameSize}px`,
    "--body-size": `${bodySize}px`,
    "--tex": textureUrl(state.design.texture, palette.dark) === "none" ? "none" : `url(${textureUrl(state.design.texture, palette.dark)})`,
    "--blend": palette.dark ? "screen" : "multiply",
    "--tex-o": strength,
    "--panel": `${state.design.backdrop}`,
    "--panel-blur": `${state.design.blur}px`,
  } as CSSProperties;

  function host(key: string) {
    const framed = state.design.frameOn && (key === "hero" || state.design.where === "all");
    return framed ? state.design.frame : "none";
  }

  function sectionClass(key: string) {
    return `aiv-sec${key === "hero" ? " hero" : ""}`;
  }

  const storyPhotos = [state.photos.story1, state.photos.story2, state.photos.story3].filter((photo) => photo.src);
  const mapHref = `https://yandex.by/maps/?text=${encodeURIComponent([state.venue, state.address, state.city].filter(Boolean).join(", "))}`;
  const coordinator = state.team.coordinator;

  return (
    <article ref={rootRef} className="aiv-inv" style={style}>
      <style>{`
        .aiv-inv{color:var(--text);background:var(--bg);font-family:var(--body-font),Georgia,serif;font-size:var(--body-size);line-height:1.5}
        .aiv-sec{position:relative;padding:var(--frame-safe-top,52px) var(--frame-safe-right,28px) var(--frame-safe-bottom,52px) var(--frame-safe-left,28px);background:var(--bg);overflow:hidden}
        .aiv-sec.hero{min-height:100svh;display:flex;flex-direction:column;justify-content:center;text-align:center}
        .aiv-tex{position:absolute;inset:0;z-index:0;background-image:var(--tex);background-size:480px;mix-blend-mode:var(--blend);opacity:var(--tex-o);pointer-events:none}
        .aiv-own{position:absolute;inset:0;z-index:0;background-position:center;background-size:cover;filter:blur(var(--own-blur));transform:scale(1.06)}
        .aiv-veil{position:absolute;inset:0;z-index:1;background:rgba(255,255,255,var(--panel));backdrop-filter:blur(var(--panel-blur));pointer-events:none}
        .aiv-inv .wf-svg{z-index:2}
        .aiv-in{position:relative;z-index:3}
        .aiv-kicker{font-family:var(--body-font),Georgia,serif;letter-spacing:.22em;text-transform:uppercase;font-size:.68em}
        .aiv-names{font-family:var(--name-font),cursive;font-size:var(--name-size);line-height:1.05;color:var(--head);font-weight:400}
        .aiv-h{font-family:var(--body-font),Georgia,serif;color:var(--head);font-size:1.7em;font-weight:500;text-align:center}
        .aiv-photo{width:100%;object-fit:cover;display:block;margin:16px 0;filter:var(--photo-filter)}
        .aiv-btn{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:0 18px;background:var(--btn);color:var(--btn-text);text-decoration:none;border:0}
        .aiv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center}
        .aiv-row{display:grid;grid-template-columns:4.5rem 1fr;gap:10px;padding:8px 0;border-top:1px solid color-mix(in srgb,var(--text) 25%,transparent)}
        .aiv-foot{text-align:center;font-size:.85em}
      `}</style>
      <Section host={host("hero")} className={sectionClass("hero")} picture={picture} blur={state.design.ownBlur} backdrop={state.design.backdrop} panelBlur={state.design.blur}>
        {ornament.mark ? <div className="aiv-in" dangerouslySetInnerHTML={{ __html: ornament.mark }} /> : null}
        <p className="aiv-kicker">Приглашение на свадьбу</p>
        <h1 className="aiv-names mt-3">{names[0]}<br />и {names[1]}</h1>
        <p className="mt-4">{[state.date ? new Date(`${state.date}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "Дата", state.time, state.city || "Город"].filter(Boolean).join(" · ")}</p>
        {state.photos.hero.src ? <img className="aiv-photo" style={{ ["--photo-filter" as string]: photoFilterCss(state.design.photoFilter), height: desktop ? 360 : 420, objectPosition: `${state.photos.hero.focusX * 100}% ${state.photos.hero.focusY * 100}%` }} src={state.photos.hero.src} alt="" /> : null}
        {state.photos.hero.low ? <p className="mt-2 text-xs">Фото низкого качества. На телефоне гостя оно может быть мягким.</p> : null}
      </Section>
      {visible.map((key) => {
        if (key === "welcome") {
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}>{ornament.divider ? <div dangerouslySetInnerHTML={{ __html: ornament.divider }} /> : null}<p className="whitespace-pre-wrap">{state.intro}</p></Section>;
        }
        if (key === "story") {
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}><h2 className="aiv-h">Наша история</h2><p className="mt-3 whitespace-pre-wrap">{state.story}</p>{storyPhotos.map((photo) => <img key={photo.src.slice(0, 24)} className="aiv-photo" style={{ ["--photo-filter" as string]: photoFilterCss(state.design.photoFilter), aspectRatio: "4/5" }} src={photo.src} alt="" />)}</Section>;
        }
        if (key === "program") {
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}><h2 className="aiv-h">Программа дня</h2><div className="mt-4">{state.program.filter((row) => row.time || row.title).map((row, index) => <div className="aiv-row" key={`${row.time}-${index}`}><b>{row.time}</b><span><b style={{ color: "var(--head)" }}>{row.title}</b><br />{row.text}</span></div>)}</div></Section>;
        }
        if (key === "place") {
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}><h2 className="aiv-h">{state.venue || "Место"}</h2><p className="mt-3 text-center">{[state.address, state.city].filter(Boolean).join(", ")}</p>{state.howToGet ? <p className="mt-2 text-center">{state.howToGet}</p> : null}<p className="mt-4 text-center"><a className="aiv-btn" href={mapHref} target="_blank" rel="noreferrer">Открыть на карте</a></p>{coordinator?.name ? <p className="mt-4 text-center">Координатор {coordinator.name}{coordinator.phone ? <> · <a href={`tel:${coordinator.phone}`}>Позвонить</a></> : null}</p> : null}{state.photos.venue.src ? <img className="aiv-photo" style={{ ["--photo-filter" as string]: photoFilterCss(state.design.photoFilter), aspectRatio: "3/2" }} src={state.photos.venue.src} alt="" /> : null}</Section>;
        }
        if (key === "dress") {
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}><h2 className="aiv-h">{state.dressTitle || "Дресс-код"}</h2><p className="mt-3 whitespace-pre-wrap text-center">{state.dressText}</p><div className="mt-4 flex justify-center gap-2">{[palette.bg2, variant.frame, variant.accent, variant.head].map((color) => <i key={color} className="inline-block h-8 w-8 rounded-full border border-white/40" style={{ background: color }} />)}</div></Section>;
        }
        if (key === "gifts") {
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}><h2 className="aiv-h">Пожелания</h2>{state.gifts ? <p className="mt-3 whitespace-pre-wrap text-center">{state.gifts}</p> : null}{state.flowers ? <p className="mt-3 text-center">{state.flowers}</p> : null}</Section>;
        }
        if (key === "timer" && countdown) {
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}><h2 className="aiv-h">До встречи</h2>{countdown.done ? <p className="mt-3 text-center">Уже сегодня</p> : <div className="aiv-grid mt-4"><div><b className="aiv-names" style={{ fontSize: "1.6rem" }}>{countdown.days}</b><div>{plural(countdown.days, "день", "дня", "дней")}</div></div><div><b className="aiv-names" style={{ fontSize: "1.6rem" }}>{countdown.hours}</b><div>{plural(countdown.hours, "час", "часа", "часов")}</div></div><div><b className="aiv-names" style={{ fontSize: "1.6rem" }}>{countdown.minutes}</b><div>{plural(countdown.minutes, "минута", "минуты", "минут")}</div></div></div>}<p className="mt-4 text-center"><button type="button" className="aiv-btn" onClick={() => downloadIcs(state)}>В календарь</button></p></Section>;
        }
        if (key === "contacts") {
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}><h2 className="aiv-h">Связь</h2><p className="mt-3 text-center">{state.phone}</p>{state.telegram ? <p className="mt-2 text-center">{state.telegram}</p> : null}</Section>;
        }
        if (key === "rsvp") {
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}><h2 className="aiv-h">Вы будете?</h2><RsvpDemo /></Section>;
        }
        if (key === "team") {
          const people = teamRoles.filter((role) => state.team[role.id]?.name.trim());
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}><h2 className="aiv-h">Кто помогает</h2><ul className="mt-3 space-y-2 text-center">{people.map((role) => <li key={role.id}>{role.name}: {state.team[role.id].name}{state.team[role.id].phone ? ` · ${state.team[role.id].phone}` : ""}</li>)}</ul></Section>;
        }
        if (key === "final") {
          return <Section key={key} host={host(key)} className={sectionClass(key)} backdrop={state.design.backdrop} panelBlur={state.design.blur}><h2 className="aiv-h">Ждём вас</h2>{state.closing ? <p className="mt-3 whitespace-pre-wrap text-center">{state.closing}</p> : null}{state.photos.final.src ? <img className="aiv-photo" style={{ ["--photo-filter" as string]: photoFilterCss(state.design.photoFilter), aspectRatio: "4/5" }} src={state.photos.final.src} alt="" /> : null}</Section>;
        }
        return null;
      })}
      <footer className="aiv-sec aiv-foot">
        <p>{names[0]} и {names[1]}{state.date ? ` · ${state.date.slice(0, 4)}` : ""}</p>
        <p className="mt-2"><a href="https://aivision.by/?ref=site">Приглашение сделано на aivision.by</a></p>
      </footer>
    </article>
  );
}

function Section({ children, className, host, picture, blur = 0, backdrop, panelBlur }: { children: ReactNode; className: string; host: string; picture?: string; blur?: number; backdrop: number; panelBlur: number }) {
  return (
    <section className={className} data-frame-host={host} style={{ "--own-blur": `${blur}px`, "--panel": backdrop, "--panel-blur": `${panelBlur}px` } as CSSProperties}>
      {picture ? <div className="aiv-own" style={{ backgroundImage: `url(${picture})` }} /> : <div className="aiv-tex" />}
      {backdrop > 0 || panelBlur > 0 ? <div className="aiv-veil" /> : null}
      <div className="aiv-in">{children}</div>
    </section>
  );
}

function RsvpDemo() {
  const [sent, setSent] = useState(false);
  if (sent) return <p className="mt-3 text-center">Спасибо. В этой версии ответ остаётся на экране и никуда не отправляется.</p>;
  return (
    <form className="mt-4 grid gap-3" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
      <input className="min-h-11 border-b bg-transparent" placeholder="Имя" required />
      <input className="min-h-11 border-b bg-transparent" placeholder="Буду / не смогу" required />
      <button className="aiv-btn" type="submit">Ответить</button>
    </form>
  );
}

function downloadIcs(state: BuilderState) {
  if (!state.date) return;
  const stamp = `${state.date.replaceAll("-", "")}T${(state.time || "15:00").replace(":", "")}00`;
  const body = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${stamp}\nSUMMARY:${state.partner1} и ${state.partner2}\nLOCATION:${state.address}\nEND:VEVENT\nEND:VCALENDAR`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  link.download = "svadba.ics";
  link.click();
  URL.revokeObjectURL(link.href);
}
