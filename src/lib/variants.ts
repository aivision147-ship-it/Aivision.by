import type { MiddleDraft } from "@/data/middle-presets";

export const VARIANTS_KEY = "aiv-cabinet-variants";

export type CabinetVariant = {
  id: string;
  at: string;
  templateId: string;
  templateName: string;
  partner1: string;
  partner2: string;
  draft: MiddleDraft;
  pay: boolean;
};

export function loadVariants(): CabinetVariant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VARIANTS_KEY);
    const list = raw ? (JSON.parse(raw) as CabinetVariant[]) : [];
    return Array.isArray(list) ? list.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export function writeVariants(list: CabinetVariant[]) {
  const next = list.slice(0, 3);
  localStorage.setItem(VARIANTS_KEY, JSON.stringify(next));
  return next;
}

export function saveVariant(input: Omit<CabinetVariant, "id" | "at" | "pay"> & { id?: string }): CabinetVariant[] {
  const current = loadVariants();
  const same = current.find((item) => item.templateId === input.templateId);
  const saved: CabinetVariant = {
    id: same?.id ?? input.id ?? crypto.randomUUID(),
    at: new Date().toISOString(),
    templateId: input.templateId,
    templateName: input.templateName,
    partner1: input.partner1,
    partner2: input.partner2,
    draft: input.draft,
    pay: same?.pay ?? current.length === 0,
  };
  const rest = current.filter((item) => item.templateId !== input.templateId);
  const next = [saved, ...rest].slice(0, 3);
  if (!next.some((item) => item.pay) && next[0]) next[0].pay = true;
  return writeVariants(next);
}

export function choosePay(id: string) {
  return writeVariants(loadVariants().map((item) => ({ ...item, pay: item.id === id })));
}
