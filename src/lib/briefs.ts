export type TierId = "linen" | "silk" | "velvet";

export type Brief = {
  id: string;
  names: string;
  date: string;
  city: string;
  guests: string;
  tier: TierId;
  formatName?: string;
  contact: string;
  note: string;
  createdAt: string;
};

const KEY = "vela-briefs";

export function readBriefs(): Brief[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Brief[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBrief(brief: Brief) {
  const next = [brief, ...readBriefs()].slice(0, 8);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function briefText(brief: Brief, tierName: string) {
  return [
    "Заявка на сайт-приглашение · aivision.by",
    `Пара: ${brief.names}`,
    `Дата: ${brief.date || "ещё не выбрана"}`,
    `Город: ${brief.city || "—"}`,
    brief.guests ? `Гостей: ${brief.guests}` : "",
    `Формат: ${tierName}`,
    `Связь: ${brief.contact}`,
    brief.note ? `Пожелания: ${brief.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
