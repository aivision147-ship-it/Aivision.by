export type InviteBackground = {
  id: string;
  name: string;
  color: string;
  dark: boolean;
  mobile: string;
  desktop: string;
};

// Временно все десять фонов лежат в Middle.
// Когда будем заканчивать весь сайт, напомнить: изумруд, арт-деко, шёлк и гравюру можно перенести в Premium и Luxury.
export const inviteBackgrounds: InviteBackground[] = [
  { id: "paper", name: "Бумага", color: "#f0ece4", dark: false, mobile: "/backgrounds/01-paper/bg-mobile.webp", desktop: "/backgrounds/01-paper/bg-desktop.webp" },
  { id: "kraft", name: "Крафт", color: "#c4a374", dark: false, mobile: "/backgrounds/02-kraft/bg-mobile.webp", desktop: "/backgrounds/02-kraft/bg-desktop.webp" },
  { id: "marble", name: "Мрамор", color: "#fcfbfb", dark: false, mobile: "/backgrounds/03-marble/bg-mobile.webp", desktop: "/backgrounds/03-marble/bg-desktop.webp" },
  { id: "peonies", name: "Пионы", color: "#f8f7f5", dark: false, mobile: "/backgrounds/04-peonies/bg-mobile.webp", desktop: "/backgrounds/04-peonies/bg-desktop.webp" },
  { id: "eucalyptus", name: "Эвкалипт", color: "#f9f5ee", dark: false, mobile: "/backgrounds/05-eucalyptus/bg-mobile.webp", desktop: "/backgrounds/05-eucalyptus/bg-desktop.webp" },
  { id: "ornament", name: "Орнамент", color: "#efefed", dark: false, mobile: "/backgrounds/06-belarus-ornament/bg-mobile.webp", desktop: "/backgrounds/06-belarus-ornament/bg-desktop.webp" },
  { id: "emerald", name: "Изумруд", color: "#0b281b", dark: true, mobile: "/backgrounds/07-emerald-gold/bg-mobile.webp", desktop: "/backgrounds/07-emerald-gold/bg-desktop.webp" },
  { id: "deco", name: "Арт-деко", color: "#060f1e", dark: true, mobile: "/backgrounds/08-art-deco/bg-mobile.webp", desktop: "/backgrounds/08-art-deco/bg-desktop.webp" },
  { id: "silk", name: "Шёлк", color: "#e6bfb9", dark: false, mobile: "/backgrounds/09-silk-powder/bg-mobile.webp", desktop: "/backgrounds/09-silk-powder/bg-desktop.webp" },
  { id: "engraving", name: "Гравюра", color: "#f6eeda", dark: false, mobile: "/backgrounds/10-vintage-botanical/bg-mobile.webp", desktop: "/backgrounds/10-vintage-botanical/bg-desktop.webp" },
];
