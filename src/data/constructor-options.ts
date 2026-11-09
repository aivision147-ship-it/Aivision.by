import { inviteBackgrounds } from "@/data/backgrounds";

export const colors = [
  ["Молочный", "#f3ece1"],
  ["Слоновая кость", "#f6f1e7"],
  ["Пудра", "#ecd3cc"],
  ["Розовый дым", "#dcc0c0"],
  ["Персик", "#efd6c2"],
  ["Шалфей", "#c9d3c0"],
  ["Оливка", "#a8ad8c"],
  ["Пыльно-голубой", "#c5d2de"],
  ["Лаванда", "#d6d0e2"],
  ["Песок", "#d9c7a7"],
  ["Терракота", "#c27556"],
  ["Изумруд", "#0f4a3a"],
  ["Бордо", "#5e1b26"],
  ["Тёмно-синий", "#18243d"],
  ["Графит", "#2c2c2e"],
  ["Шоколад", "#3b2a22"],
] as const;

export const textures = [
  { id: "coldpress", name: "Акварельная бумага" },
  { id: "velvet", name: "Бархат" },
  { id: "venetian-plaster", name: "Штукатурка" },
  { id: "laid-paper", name: "Верже" },
  { id: "paper-gray", name: "Пастельная бумага" },
  { id: "kraft-gray", name: "Крафт" },
  { id: "linen-gray", name: "Лён" },
  { id: "none", name: "Без текстуры" },
] as const;

export const fontPairs = [
  { id: "classic", name: "Классика", script: "great-vibes", body: "cormorant-garamond", scriptName: "Great Vibes", bodyName: "Cormorant", nameMobile: 62, nameDesktop: 92, bodyMobile: 19, bodyDesktop: 21.3 },
  { id: "modern-classic", name: "Современная классика", script: "great-vibes", body: "montserrat", scriptName: "Great Vibes", bodyName: "Montserrat", nameMobile: 62, nameDesktop: 92, bodyMobile: 15.5, bodyDesktop: 17.4 },
  { id: "palace", name: "Дворцовая", script: "miama-nueva", body: "eb-garamond", scriptName: "Miama", bodyName: "EB Garamond", nameMobile: 46, nameDesktop: 70, bodyMobile: 18, bodyDesktop: 20.2 },
  { id: "grace", name: "Изящная", script: "miama-nueva", body: "raleway", scriptName: "Miama", bodyName: "Raleway", nameMobile: 46, nameDesktop: 70, bodyMobile: 16, bodyDesktop: 17.9 },
  { id: "romance", name: "Романтика", script: "bad-script", body: "playfair-display", scriptName: "Bad Script", bodyName: "Playfair", nameMobile: 50, nameDesktop: 76, bodyMobile: 16.5, bodyDesktop: 18.5 },
  { id: "watercolor", name: "Акварель", script: "bad-script", body: "lora", scriptName: "Bad Script", bodyName: "Lora", nameMobile: 50, nameDesktop: 76, bodyMobile: 16.5, bodyDesktop: 18.5 },
  { id: "letter", name: "Тёплое письмо", script: "marck-script", body: "philosopher", scriptName: "Marck Script", bodyName: "Philosopher", nameMobile: 50, nameDesktop: 76, bodyMobile: 17, bodyDesktop: 19 },
  { id: "modern", name: "Модерн", script: "magnolia-script", body: "montserrat", scriptName: "Magnolia", bodyName: "Montserrat", nameMobile: 46, nameDesktop: 70, bodyMobile: 15.5, bodyDesktop: 17.4 },
  { id: "boho", name: "Бохо", script: "magnolia-script", body: "lora", scriptName: "Magnolia", bodyName: "Lora", nameMobile: 46, nameDesktop: 70, bodyMobile: 16.5, bodyDesktop: 18.5 },
  { id: "manor", name: "Старинная усадьба", script: "russkopis", body: "prata", scriptName: "Russkopis", bodyName: "Prata", nameMobile: 52, nameDesktop: 78, bodyMobile: 16, bodyDesktop: 17.9 },
] as const;

export const frames = [
  { id: "thin", name: "Тонкая", divider: "line-dot", mark: "rings" },
  { id: "double", name: "Двойная", divider: "double", mark: "rings" },
  { id: "arch", name: "Арка", divider: "diamond", mark: "rings" },
  { id: "classic", name: "Уголки", divider: "scroll", mark: "flourish" },
  { id: "notch", name: "Вырезы", divider: "deco", mark: "fan" },
  { id: "deco", name: "Арт-деко", divider: "deco", mark: "fan" },
  { id: "vintage", name: "Вензеля", divider: "scroll", mark: "flourish" },
  { id: "pearl", name: "Жемчуг", divider: "pearls", mark: "rings" },
  { id: "belarus", name: "Орнамент", divider: "belarus", mark: "star" },
  { id: "oval", name: "Овал", divider: "diamond", mark: "rings" },
  { id: "minimal", name: "Линии", divider: "diamond", mark: "rings" },
  { id: "botanical", name: "Веточка", divider: "sprig", mark: "wreath" },
] as const;

export const starts = [
  { id: "manor", name: "Усадьба", texture: "linen-gray", color: "#f3ece1", variant: "folk", frame: "belarus", pair: "manor" },
  { id: "garden", name: "Сад", texture: "coldpress", color: "#c9d3c0", variant: "tone", frame: "botanical", pair: "watercolor" },
  { id: "evening", name: "Вечер", texture: "velvet", color: "#18243d", variant: "gold", frame: "deco", pair: "palace" },
  { id: "letter", name: "Письмо", texture: "laid-paper", color: "#f6f1e7", variant: "neutral", frame: "thin", pair: "letter" },
] as const;

export const teamRoles = [
  { id: "coordinator", name: "Координатор" },
  { id: "host", name: "Ведущий" },
  { id: "music", name: "Музыка" },
  { id: "photo", name: "Фотограф" },
  { id: "video", name: "Видеограф" },
  { id: "decor", name: "Декор" },
  { id: "flowers", name: "Флорист" },
  { id: "makeup", name: "Визаж" },
  { id: "cake", name: "Торт" },
  { id: "venue", name: "Площадка" },
] as const;

export const photoSlots = [
  { id: "hero", name: "Первый экран" },
  { id: "story1", name: "История 1" },
  { id: "story2", name: "История 2" },
  { id: "story3", name: "История 3" },
  { id: "venue", name: "Площадка" },
  { id: "final", name: "Финал" },
] as const;

export const photoFilters = [
  { id: "site", name: "В цвет сайта" },
  { id: "none", name: "Как есть" },
  { id: "warm", name: "Тёплый" },
  { id: "film", name: "Плёнка" },
  { id: "bw", name: "Ч/б" },
] as const;

export type PhotoSlotId = (typeof photoSlots)[number]["id"];
export type PhotoFilter = (typeof photoFilters)[number]["id"];

export type PhotoSlot = { src: string; low: boolean; focusX: number; focusY: number };

export type ProgramRow = { time: string; title: string; text: string };

export type BuilderState = {
  design: {
    texture: string;
    strength: number;
    color: string;
    variant: string;
    frame: string;
    frameOn: boolean;
    where: "hero" | "all";
    stroke: number;
    opacity: number;
    inset: number;
    scale: number;
    backdrop: number;
    blur: number;
    alternate: boolean;
    pair: string;
    nameK: number;
    bodyK: number;
    backgroundId: string;
    ownBackground: string;
    ownBlur: number;
    ownFont: boolean;
    fontRights: boolean;
    photoFilter: PhotoFilter;
  };
  partner1: string;
  partner2: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  address: string;
  howToGet: string;
  intro: string;
  story: string;
  program: ProgramRow[];
  dressTitle: string;
  dressText: string;
  gifts: string;
  flowers: string;
  phone: string;
  telegram: string;
  closing: string;
  blocks: Record<string, boolean>;
  team: Record<string, { name: string; phone: string }>;
  photos: Record<PhotoSlotId, PhotoSlot>;
};

const emptyPhoto = (): PhotoSlot => ({ src: "", low: false, focusX: 0.5, focusY: 0.38 });

export function defaultBuilder(): BuilderState {
  return {
    design: {
      texture: "coldpress",
      strength: 0.6,
      color: "#f3ece1",
      variant: "gold",
      frame: "classic",
      frameOn: true,
      where: "hero",
      stroke: 1.5,
      opacity: 1,
      inset: 18,
      scale: 1,
      backdrop: 0,
      blur: 0,
      alternate: false,
      pair: "classic",
      nameK: 1,
      bodyK: 1,
      backgroundId: "",
      ownBackground: "",
      ownBlur: 0,
      ownFont: false,
      fontRights: false,
      photoFilter: "site",
    },
    partner1: "",
    partner2: "",
    date: "",
    time: "15:00",
    city: "",
    venue: "",
    address: "",
    howToGet: "",
    intro: "",
    story: "",
    program: [{ time: "", title: "", text: "" }],
    dressTitle: "",
    dressText: "",
    gifts: "",
    flowers: "",
    phone: "",
    telegram: "",
    closing: "",
    blocks: { welcome: true, story: true, program: true, place: true, dress: true, gifts: true, timer: true, contacts: true, rsvp: true, team: true, final: true },
    team: Object.fromEntries(teamRoles.map((role) => [role.id, { name: "", phone: "" }])),
    photos: { hero: emptyPhoto(), story1: emptyPhoto(), story2: emptyPhoto(), story3: emptyPhoto(), venue: emptyPhoto(), final: emptyPhoto() },
  };
}

export function hydrateBuilder(raw: Partial<BuilderState> | null): BuilderState {
  const base = defaultBuilder();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    design: { ...base.design, ...raw.design },
    blocks: { ...base.blocks, ...raw.blocks },
    team: { ...base.team, ...raw.team },
    photos: { ...base.photos, ...raw.photos },
    program: raw.program?.length ? raw.program : base.program,
  };
}

export function textureUrl(id: string, dark: boolean) {
  if (id === "none") return "none";
  return `/textures/${id}-${dark ? "dark" : "light"}.webp`;
}

export function blockVisible(state: BuilderState, key: string) {
  if (!state.blocks[key]) return false;
  const storyPhotos = [state.photos.story1, state.photos.story2, state.photos.story3].some((photo) => photo.src);
  if (key === "welcome") return state.intro.trim().length > 0;
  if (key === "story") return state.story.trim().length > 0 || storyPhotos;
  if (key === "program") return state.program.some((row) => row.time || row.title || row.text);
  if (key === "place") return Boolean(state.venue.trim() || state.address.trim() || state.city.trim());
  if (key === "dress") return Boolean(state.dressTitle.trim() || state.dressText.trim());
  if (key === "gifts") return Boolean(state.gifts.trim() || state.flowers.trim());
  if (key === "timer") return Boolean(state.date);
  if (key === "contacts") return Boolean(state.phone.trim() || state.telegram.trim());
  if (key === "team") return teamRoles.some((role) => state.team[role.id]?.name.trim());
  if (key === "final") return Boolean(state.closing.trim() || state.photos.final.src);
  return true;
}

export function photoFilterCss(filter: PhotoFilter) {
  if (filter === "warm") return "sepia(.35) saturate(1.15)";
  if (filter === "film") return "contrast(1.08) sepia(.22) saturate(.85)";
  if (filter === "bw") return "grayscale(1) contrast(1.05)";
  if (filter === "site") return "sepia(.45) saturate(.8) contrast(1.04)";
  return "none";
}

export { inviteBackgrounds };
