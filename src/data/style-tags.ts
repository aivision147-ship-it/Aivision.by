export const styleTags = [
  "belarusian",
  "classic",
  "minimal",
  "boho",
  "botanical",
  "dark-evening",
  "retro",
  "seasonal",
  "sea",
] as const;

export type StyleTag = (typeof styleTags)[number];

export const styleTagLabel: Record<StyleTag, string> = {
  belarusian: "Белорусский",
  classic: "Классика",
  minimal: "Минимализм",
  boho: "Бохо",
  botanical: "Ботаника",
  "dark-evening": "Тёмный вечер",
  retro: "Ретро",
  seasonal: "Сезон",
  sea: "Море",
};
