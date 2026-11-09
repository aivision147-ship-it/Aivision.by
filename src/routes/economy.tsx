import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/economy")({
  head: () => ({
    meta: [
      { title: "Собрать карточку — Economy — AIVISION STUDIO" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Alice&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Literata:ital,wght@0,500;0,600;1,500&family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Poiret+One&family=Tenor+Sans&display=swap",
      },
    ],
  }),
  component: EconomyBuilder,
});

const backgrounds = [
  { id: "peony", label: "Пион", src: "/photos/peony.jpg" },
  { id: "garden", label: "Сад", src: "/photos/garden.jpg" },
  { id: "sea", label: "Море", src: "/photos/sea.jpg" },
  { id: "still", label: "Свеча", src: "/photos/still.jpg" },
] as const;

const fonts = [
  { id: "soft", label: "Мягкий", family: "Cormorant Infant" },
  { id: "garamond", label: "Высокий", family: "Cormorant Garamond" },
  { id: "playfair", label: "Журнал", family: "Playfair Display" },
  { id: "tenor", label: "Тихий", family: "Tenor Sans" },
  { id: "alice", label: "Сказка", family: "Alice" },
  { id: "poiret", label: "Тонкий", family: "Poiret One" },
  { id: "book", label: "Книжный", family: "Literata" },
  { id: "plain", label: "Прямой", family: "Nunito Sans" },
] as const;

const inkColors = [
  { id: "ink", label: "Чернила", value: "#2a2224" },
  { id: "rose", label: "Роза", value: "#a85d6c" },
  { id: "bronze", label: "Бронза", value: "#8a5a32" },
  { id: "deep", label: "Вино", value: "#6d3a46" },
  { id: "cream", label: "Сливки", value: "#fbf8f4" },
] as const;

type FontId = (typeof fonts)[number]["id"];
type BgId = (typeof backgrounds)[number]["id"];

function EconomyBuilder() {
  const [names, setNames] = useState("Софья и Марк");
  const [date, setDate] = useState("12 июня 2027");
  const [time, setTime] = useState("суббота, 15:00");
  const [place, setPlace] = useState("Усадьба «Лошица»");
  const [address, setAddress] = useState("Минск, Лошицкий парк");
  const [contact, setContact] = useState("Анна · +375 29 000-00-00");
  const [fontId, setFontId] = useState<FontId>("soft");
  const [ink, setInk] = useState("#2a2224");
  const [bgId, setBgId] = useState<BgId>("peony");
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileRef = useRef<Blob | null>(null);

  const family = fonts.find((item) => item.id === fontId)?.family ?? "Cormorant Infant";
  const background = customBg ?? backgrounds.find((item) => item.id === bgId)?.src ?? backgrounds[0].src;

  function chooseBackground(id: BgId) {
    if (customBg) URL.revokeObjectURL(customBg);
    setCustomBg(null);
    setBgId(id);
  }

  function uploadBackground(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    if (customBg) URL.revokeObjectURL(customBg);
    setCustomBg(URL.createObjectURL(file));
  }

  async function download() {
    setSaving(true);
    setSaveError("");
    try {
      await document.fonts.load(`128px "${family}"`);
      await document.fonts.ready;
      const blob = await renderCard({
        names,
        date,
        time,
        place,
        address,
        contact,
        family,
        background,
        color: ink,
      });
      const url = URL.createObjectURL(blob);
      fileRef.current = blob;
      setSavedUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return url;
      });
      setSaveError("");
    } catch {
      setSaveError("Картинка не собралась. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  async function saveFile() {
    const blob = fileRef.current;
    if (!blob) return;
    const file = new File([blob], "priglashenie.png", { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Приглашение" });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    try {
      const savePicker = (window as unknown as { showSaveFilePicker?: (options: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<{ createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }> }> }).showSaveFilePicker;
      if (typeof savePicker === "function") {
        const handle = await savePicker({
          suggestedName: "priglashenie.png",
          types: [{ description: "PNG", accept: { "image/png": [".png"] } }],
        });
        const stream = await handle.createWritable();
        await stream.write(blob);
        await stream.close();
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "priglashenie.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (window.parent !== window) setSheet(true);
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <Link to="/" className="wordmark font-serif text-lg tracking-wide">
            AiVISION STUDIO
          </Link>
          <Link to="/" className="text-sm text-muted">
            На главную
          </Link>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-8 md:grid-cols-[minmax(0,280px)_1fr] md:items-start">
        <div className="mx-auto w-[min(100%,280px)] md:sticky md:top-8">
          <Card
            names={names}
            date={date}
            time={time}
            place={place}
            address={address}
            contact={contact}
            family={family}
            color={ink}
            background={background}
          />
        </div>
        <form
          className="flex flex-col gap-4 pb-28"
          onSubmit={(event) => {
            event.preventDefault();
            void download();
          }}
        >
          <div>
            <p className="text-xs tracking-label text-burgundy uppercase">Economy</p>
            <h1 className="mt-2 font-serif text-5xl">Собрать карточку</h1>
            <p className="mt-3 text-sm text-muted">
              Картинка 9:16. Скачайте её и отправьте гостям в чат. Домена и сайта здесь нет.
            </p>
          </div>
          <Field label="Имена" value={names} onChange={setNames} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Дата" value={date} onChange={setDate} />
            <Field label="Время" value={time} onChange={setTime} />
          </div>
          <Field label="Место" value={place} onChange={setPlace} />
          <Field label="Адрес" value={address} onChange={setAddress} />
          <Field label="Контакт" value={contact} onChange={setContact} />
          <fieldset>
            <legend className="text-sm text-ink">Шрифт</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {fonts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    fontId === item.id
                      ? "min-h-12 border border-burgundy bg-burgundy text-sm text-cream"
                      : "min-h-12 border border-line bg-cream text-sm"
                  }
                  style={{ fontFamily: item.family }}
                  onClick={() => setFontId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm text-ink">Фон</legend>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {backgrounds.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    !customBg && bgId === item.id
                      ? "overflow-hidden rounded-xl border-2 border-burgundy"
                      : "overflow-hidden rounded-xl border border-line"
                  }
                  onClick={() => chooseBackground(item.id)}
                >
                  <img src={item.src} alt="" className="aspect-[9/16] w-full object-cover" />
                  <span className="block py-1 text-center text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm text-ink">Цвет шрифта</legend>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {inkColors.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    ink === item.value
                      ? "min-h-11 border-2 border-burgundy bg-cream px-3 text-sm"
                      : "min-h-11 border border-line bg-cream px-3 text-sm"
                  }
                  onClick={() => setInk(item.value)}
                >
                  <span className="mr-2 inline-block size-3 rounded-full border border-line" style={{ background: item.value }} />
                  {item.label}
                </button>
              ))}
              <label className="flex min-h-11 items-center gap-2 border border-line bg-cream px-3 text-sm">
                Свой
                <input type="color" value={ink} aria-label="Свой цвет шрифта" onChange={(event) => setInk(event.target.value)} />
              </label>
            </div>
          </fieldset>
          <label className="block text-sm text-ink">
            Свой фон
            <input
              className="studio-input mt-1"
              type="file"
              accept="image/*"
              onChange={(event) => uploadBackground(event.target.files?.[0])}
            />
            <span className="mt-1 block text-xs text-muted">
              Фото остаётся в телефоне и никуда не отправляется. Лучше вертикальный кадр.
            </span>
          </label>
          <button type="submit" className="min-h-12 bg-burgundy text-sm text-cream" disabled={saving}>
            {saving ? "Собираем картинку…" : "Собрать картинку"}
          </button>
          {saveError ? <p className="text-sm text-burgundy">{saveError}</p> : null}
          {savedUrl ? (
            <div>
              <img src={savedUrl} alt="Готовая карточка" className="mx-auto w-40 rounded-xl" />
              <button
                type="button"
                className="mt-3 min-h-12 w-full border border-burgundy text-sm text-burgundy"
                onClick={() => void saveFile()}
              >
                Сохранить файл
              </button>
            </div>
          ) : null}
          {sheet && savedUrl ? (
            <div className="fixed inset-0 z-50 flex flex-col bg-[#1c1210]">
              <img src={savedUrl} alt="Приглашение" className="min-h-0 w-full flex-1 object-contain" />
              <div className="safe-dock flex flex-col gap-2 bg-[#1c1210] px-5 py-4 text-center text-sm text-cream">
                <p>Удерживайте картинку и выберите «Сохранить изображение».</p>
                <button type="button" className="min-h-12 border border-cream" onClick={() => setSheet(false)}>
                  Закрыть
                </button>
              </div>
            </div>
          ) : null}
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm text-ink">
      {label}
      <input className="studio-input mt-1" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Card({
  names,
  date,
  time,
  place,
  address,
  contact,
  family,
  color,
  background,
}: {
  names: string;
  date: string;
  time: string;
  place: string;
  address: string;
  contact: string;
  family: string;
  color: string;
  background: string;
}) {
  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-2xl shadow-sm">
      <img src={background} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#faf5f3]/45" />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ color, fontFamily: family, textShadow: "0 1px 10px rgba(250,245,243,0.45)" }}
      >
        <p className="text-[10px] tracking-[0.22em] uppercase">Приглашение</p>
        <p className="mt-3 text-4xl leading-none">{names || "Имена"}</p>
        <div className="my-3 h-px w-10" style={{ background: color }} />
        <p className="text-lg">{date}</p>
        {time ? <p className="mt-1 text-xs">{time}</p> : null}
        <p className="mt-3 text-base">{place}</p>
        {address ? <p className="mt-1 text-xs">{address}</p> : null}
        {contact ? <p className="mt-4 text-xs">{contact}</p> : null}
      </div>
    </div>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("фон не загрузился"));
    image.src = src;
  });
}

async function renderCard(input: {
  names: string;
  date: string;
  time: string;
  place: string;
  address: string;
  contact: string;
  family: string;
  background: string;
  color: string;
}) {
  const width = 1080;
  const height = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const image = await loadImage(input.background);
  const scale = Math.max(width / image.width, height / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, (width - dw) / 2, (height - dh) / 2, dw, dh);
  ctx.fillStyle = "rgba(250,245,243,0.45)";
  ctx.fillRect(0, 0, width, height);

  const rows: Array<{ text: string; font: string; gap: number; track?: boolean }> = [
    { text: "ПРИГЛАШЕНИЕ", font: `500 28px "${input.family}"`, gap: 48, track: true },
    { text: input.names || "Имена", font: `600 120px "${input.family}"`, gap: 36 },
    { text: input.date, font: `600 54px "${input.family}"`, gap: 18 },
    { text: input.time, font: `500 32px "${input.family}"`, gap: 40 },
    { text: input.place, font: `600 48px "${input.family}"`, gap: 16 },
    { text: input.address, font: `500 32px "${input.family}"`, gap: 48 },
    { text: input.contact, font: `500 32px "${input.family}"`, gap: 0 },
  ].filter((row) => row.text.trim());

  const heights = rows.map((row) => {
    ctx.font = row.font;
    return ctx.measureText(row.text).actualBoundingBoxAscent + ctx.measureText(row.text).actualBoundingBoxDescent;
  });
  const total = heights.reduce((sum, item, index) => sum + item + rows[index].gap, 0);
  let y = (height - total) / 2;

  rows.forEach((row, index) => {
    ctx.font = row.font;
    ctx.fillStyle = input.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const size = Number(row.font.match(/(\d+)px/)?.[1] ?? 32);
    const text = row.text;
    const max = width - 140;
    let drawSize = size;
    ctx.font = row.font.replace(`${size}px`, `${drawSize}px`);
    while (ctx.measureText(text).width > max && drawSize > 28) {
      drawSize -= 2;
      ctx.font = row.font.replace(`${size}px`, `${drawSize}px`);
    }
    if (row.track) {
      const gap = 10;
      const chars = text.split("");
      const widths = chars.map((char) => ctx.measureText(char).width);
      const block = widths.reduce((sum, item) => sum + item, 0) + gap * (chars.length - 1);
      let x = (width - block) / 2;
      chars.forEach((char, charIndex) => {
        ctx.textAlign = "left";
        ctx.fillText(char, x, y);
        x += widths[charIndex] + gap;
      });
    } else {
      ctx.fillText(text, width / 2, y);
    }
    y += heights[index] + row.gap;
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), "image/png");
  });
}
