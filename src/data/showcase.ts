import { catalogStyleMarks, catalogTemplates } from "@/data/catalog-presets";
import { middleTemplates } from "@/data/middle-presets";
import type { StyleTag } from "@/data/style-tags";

const ownMarks: Record<string, { bg: string; ink: string; line: string }> = {
  edition: { bg: "#f4efe6", ink: "#1c1916", line: "#c4a574" },
  vasilek: { bg: "#e7eef8", ink: "#24324a", line: "#7d98c9" },
  kadry: { bg: "#1f2a1c", ink: "#f3efe4", line: "#d7c48a" },
  rushnik: { bg: "#fbf6ef", ink: "#6d1d24", line: "#c45a4a" },
  vyshyvka: { bg: "#f6f1ea", ink: "#9d2428", line: "#241c1a" },
  zoloto: { bg: "#0e0d0c", ink: "#e8d6b0", line: "#c9a052" },
  lux: { bg: "#0c0c0b", ink: "#e8e2d6", line: "#b9a477" },
  bordo: { bg: "#2a0a10", ink: "#eeeaec", line: "#c3c6cd" },
  izumrud: { bg: "#10211a", ink: "#ece7dc", line: "#bfaa7b" },
};

const styleOf: Record<string, string> = {
  edition: "классика",
  vasilek: "ботаника",
  kadry: "минимализм",
  rushnik: "классика",
  vyshyvka: "классика",
  zoloto: "тёмные",
  lux: "тёмные",
  bordo: "тёмные",
  izumrud: "тёмные",
  eucalyptus: "ботаника",
  "dusty-blue": "классика",
  "terracotta-boho": "бохо",
  "scandi-minimal": "минимализм",
  "provence-lavender": "сезонные",
  "art-deco-teal": "тёмные",
  "wabi-sabi": "минимализм",
  "sage-botanica": "ботаника",
  "peach-blossom": "сезонные",
  "marble-rosegold": "классика",
  "line-art": "минимализм",
  "retro-70s": "ретро",
  "olive-tuscany": "ботаника",
  "winter-snow": "сезонные",
  "navy-sea": "тёмные",
  editorial: "минимализм",
  polaroid: "ретро",
  cinema: "тёмные",
  mediterranean: "сезонные",
  "gothic-romance": "тёмные",
  "garden-roses": "ботаника",
  cottagecore: "бохо",
  "modern-geometry": "минимализм",
  "chocolate-cream": "классика",
  "autumn-burgundy": "сезонные",
  "lilac-dream": "сезонные",
  "champagne-pearls": "классика",
  "sunflower-rustic": "бохо",
  "wildflower-meadow": "ботаника",
  "celestial-night": "тёмные",
};

const animated = new Set(["izumrud", "zoloto", "lux", "vyshyvka"]);

const authorIds = ["edition", "vasilek", "kadry", "rushnik", "vyshyvka", "zoloto", "lux", "bordo", "izumrud"];

const styleTagOf: Record<string, StyleTag[]> = {
  edition: ["classic"],
  vasilek: ["belarusian", "botanical"],
  kadry: ["minimal"],
  rushnik: ["belarusian"],
  vyshyvka: ["belarusian"],
  zoloto: ["dark-evening"],
  lux: ["dark-evening"],
  bordo: ["dark-evening"],
  izumrud: ["dark-evening"],
  eucalyptus: ["botanical"],
  "dusty-blue": ["classic"],
  "terracotta-boho": ["boho"],
  "scandi-minimal": ["minimal"],
  "provence-lavender": ["seasonal"],
  "art-deco-teal": ["dark-evening"],
  "wabi-sabi": ["minimal"],
  "sage-botanica": ["botanical"],
  "peach-blossom": ["seasonal"],
  "marble-rosegold": ["classic"],
  "line-art": ["minimal"],
  "retro-70s": ["retro"],
  "olive-tuscany": ["botanical"],
  "winter-snow": ["seasonal"],
  "navy-sea": ["dark-evening", "sea"],
  editorial: ["minimal"],
  polaroid: ["retro"],
  cinema: ["dark-evening"],
  mediterranean: ["sea", "seasonal"],
  "gothic-romance": ["dark-evening"],
  "garden-roses": ["botanical"],
  cottagecore: ["boho"],
  "modern-geometry": ["minimal"],
  "chocolate-cream": ["classic"],
  "autumn-burgundy": ["seasonal"],
  "lilac-dream": ["seasonal"],
  "champagne-pearls": ["classic"],
  "sunflower-rustic": ["boho"],
  "wildflower-meadow": ["botanical"],
  "celestial-night": ["dark-evening"],
};

export const showcaseStyles = ["классика", "минимализм", "бохо", "ботаника", "ретро", "тёмные", "сезонные"] as const;

export type ShowcaseItem = {
  id: string;
  code: string;
  name: string;
  file: string;
  thumb: string;
  bg: string;
  ink: string;
  line: string;
  tone: "light" | "dark";
  style: string;
  styleTags: StyleTag[];
  animated: boolean;
  simplifiedLux: boolean;
};

export function templateCode(id: string) {
  const author = authorIds.indexOf(id);
  if (author >= 0) return `A-${String(author + 1).padStart(2, "0")}`;
  const catalog = catalogTemplates.findIndex((item) => item.id === id);
  if (catalog >= 0) return `K-${String(catalog + 1).padStart(2, "0")}`;
  return id;
}

function toneOf(bg: string): "light" | "dark" {
  const hex = bg.replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? "light" : "dark";
}

const marks = { ...ownMarks, ...catalogStyleMarks };

export const showcase: ShowcaseItem[] = middleTemplates.map((item) => {
  const color = marks[item.id] ?? { bg: "#f4f1ea", ink: "#222222", line: "#888888" };
  return {
    id: item.id,
    code: templateCode(item.id),
    name: item.name,
    file: item.file,
    thumb: `/template-thumbs/${item.id}.jpg`,
    bg: color.bg,
    ink: color.ink,
    line: color.line,
    tone: toneOf(color.bg),
    style: styleOf[item.id] ?? "классика",
    styleTags: styleTagOf[item.id] ?? ["classic"],
    animated: animated.has(item.id),
    simplifiedLux: ["zoloto", "lux", "bordo", "izumrud"].includes(item.id),
  };
});

export function showcaseById(id: string) {
  return showcase.find((item) => item.id === id) ?? null;
}
