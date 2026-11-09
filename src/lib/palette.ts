type Rgb = [number, number, number];

export type PaletteVariant = {
  id: string;
  ru: string;
  text: string;
  head: string;
  frame: string;
  accent: string;
  btn: string;
  btnText: string;
  ratio: number;
  fixed: boolean;
};

const hexToRgb = (input: string): Rgb => {
  let hex = input.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((char) => char + char).join("");
  const value = Number.parseInt(hex, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const toHex = (rgb: number[]) => `#${rgb.map((value) => Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, "0")).join("")}`;

const channel = (value: number) => {
  const scaled = value / 255;
  return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
};

const lum = (rgb: Rgb) => 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);

const contrast = (a: string, b: string) => {
  const left = lum(hexToRgb(a));
  const right = lum(hexToRgb(b));
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
};

const s2l = (value: number) => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};
const l2s = (value: number) => 255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055);

export function toLch(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(s2l);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const hue = (Math.atan2(B, A) * 180) / Math.PI;
  return { L, C: Math.hypot(A, B), h: (hue + 360) % 360 };
}

export function lch(lightness: number, chroma: number, hue: number) {
  let L = Math.max(0, Math.min(1, lightness));
  let C = chroma;
  for (let step = 0; step < 40; step += 1) {
    const a = C * Math.cos((hue * Math.PI) / 180);
    const b = C * Math.sin((hue * Math.PI) / 180);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(l2s);
    if (rgb.every((value) => value > -0.5 && value < 255.5) || C < 0.001) return toHex(rgb);
    C *= 0.88;
  }
  return "#000000";
}

const mixHex = (a: string, b: string, amount: number) => toHex(hexToRgb(a).map((value, index) => value + (hexToRgb(b)[index] - value) * amount));

const texEff = (hex: string, dark: boolean, strength: number) => (dark ? mixHex(hex, "#ffffff", 0.06 * strength) : toHex(hexToRgb(hex).map((value) => value * (1 - 0.13 * strength))));

function fix(fg: string, backgrounds: string[], minimum: number, dark: boolean) {
  let color = toLch(fg);
  let output = fg;
  let steps = 0;
  const worst = (hex: string) => Math.min(...backgrounds.map((background) => contrast(hex, background)));
  while (worst(output) < minimum && steps < 60) {
    color = { ...color, L: color.L + (dark ? 0.015 : -0.015) };
    output = lch(color.L, color.C * (dark ? 0.98 : 1), color.h);
    steps += 1;
  }
  return { c: output, ratio: worst(output), fixed: steps > 0 };
}

export function palettes(base: string, textureStrength: number) {
  const source = toLch(base);
  const dark = lum(hexToRgb(base)) < 0.18;
  const hue = source.h;
  const chroma = source.C;
  const neutral = chroma < 0.025;
  const bg = base;
  const bg2 = lch(dark ? source.L + 0.045 : source.L - 0.04, chroma, hue);
  const surfaces = [texEff(bg, dark, textureStrength), texEff(bg2, dark, textureStrength)];
  const text0 = dark ? lch(0.95, Math.min(chroma * 0.5, 0.03), hue) : lch(0.28, Math.min(chroma * 0.9 + 0.015, 0.06), hue);
  const opposite = neutral ? 250 : (hue + 180) % 360;
  const gold = dark ? lch(0.83, 0.1, 85) : lch(0.62, 0.105, 78);
  const silver = dark ? lch(0.84, 0.012, 250) : lch(0.6, 0.014, 250);
  const variants = [
    { id: "tone", ru: "Тон в тон", text: text0, head: dark ? lch(0.9, Math.min(chroma + 0.03, 0.09), hue) : lch(Math.max(source.L - 0.5, 0.3), Math.min(chroma + 0.04, 0.11), hue), frame: dark ? lch(Math.min(source.L + 0.36, 0.86), Math.min(chroma + 0.02, 0.1), hue) : lch(Math.max(source.L - 0.3, 0.42), Math.min(chroma + 0.035, 0.11), hue), accent: dark ? lch(0.86, Math.min(chroma + 0.04, 0.12), hue) : lch(Math.max(source.L - 0.4, 0.35), Math.min(chroma + 0.05, 0.13), hue) },
    { id: "contrast", ru: "Контраст", text: text0, head: dark ? lch(0.86, 0.07, opposite) : lch(0.4, 0.08, opposite), frame: dark ? lch(0.78, 0.06, opposite) : lch(0.52, 0.07, opposite), accent: dark ? lch(0.82, 0.09, opposite) : lch(0.46, 0.09, opposite) },
    { id: "gold", ru: "С золотом", text: text0, head: dark ? lch(0.88, 0.08, 85) : lch(0.45, 0.08, 70), frame: gold, accent: dark ? lch(0.88, 0.11, 90) : lch(0.56, 0.11, 75) },
    { id: "silver", ru: "С серебром", text: text0, head: dark ? lch(0.92, 0.01, 250) : lch(0.35, 0.015, 250), frame: silver, accent: dark ? lch(0.9, 0.015, 250) : lch(0.5, 0.02, 250) },
    { id: "folk", ru: "Красный орнамент", text: text0, head: dark ? lch(0.86, 0.06, 30) : lch(0.42, 0.15, 26), frame: dark ? lch(0.72, 0.14, 27) : lch(0.5, 0.17, 26), accent: dark ? lch(0.84, 0.1, 75) : lch(0.4, 0.14, 24) },
    { id: "neutral", ru: "Нейтральный", text: dark ? lch(0.96, 0.004, hue) : lch(0.24, 0.004, hue), head: dark ? lch(0.98, 0.004, hue) : lch(0.2, 0.004, hue), frame: dark ? lch(0.74, 0.006, hue) : lch(0.45, 0.006, hue), accent: dark ? lch(0.88, 0.006, hue) : lch(0.3, 0.006, hue) },
  ];
  return {
    dark,
    bg,
    bg2,
    list: variants.map((variant) => {
      const text = fix(variant.text, surfaces, 4.5, dark);
      const head = fix(variant.head, surfaces, 3, dark);
      const frame = fix(variant.frame, surfaces, 2, dark);
      const accent = fix(variant.accent, surfaces, 1.8, dark);
      let button = variant.id === "tone" || variant.id === "neutral" ? head.c : accent.c;
      const light = lch(0.985, 0.01, hue);
      const ink = lch(0.2, 0.02, hue);
      let buttonText = contrast(button, light) >= contrast(button, ink) ? light : ink;
      const fixedButton = fix(button, [buttonText], 4.5, contrast(button, light) < contrast(button, ink));
      button = fixedButton.c;
      return { ...variant, text: text.c, head: head.c, frame: frame.c, accent: accent.c, btn: button, btnText: buttonText, ratio: text.ratio, fixed: text.fixed || head.fixed };
    }) satisfies PaletteVariant[],
  };
}
