const LETTERS: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

const STOP = new Set(["www", "admin", "api", "mail", "shop", "app", "test"]);

export function translit(value: string) {
  return value
    .toLowerCase()
    .split("")
    .map((char) => LETTERS[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function subdomainError(value: string) {
  if (value.length < 3 || value.length > 40) return "От 3 до 40 символов: латиница, цифры и дефис.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return "Только a–z, цифры и один дефис между словами.";
  if (STOP.has(value)) return "Это имя занято службой сайта.";
  return "";
}

export function subdomainIdeas(first: string, second: string, date: string) {
  const year = date.slice(0, 4);
  const a = translit(first);
  const b = translit(second);
  const ideas = [`${a}-i-${b}`, year ? `${a}-${b}-${year}` : ""]
    .map((item) => item.replace(/-+/g, "-").replace(/^-|-$/g, ""))
    .filter((item) => item && !subdomainError(item));
  return [...new Set(ideas)];
}
