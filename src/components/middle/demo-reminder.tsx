import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isDemoCoupleData, middleTemplates, type MiddleDraft } from "@/data/middle-presets";

const DRAFT_KEY = "aiv-middle-draft-v1";

export function DemoReminder() {
  return (
    <div className="border-2 border-burgundy bg-cream p-4 text-base text-ink">
      <p className="font-serif text-2xl leading-snug">Замените демо-имена и дату на свои</p>
      <Link to="/middle" className="mt-2 inline-flex min-h-11 items-center text-burgundy underline">
        Вернуться в конструктор
      </Link>
    </div>
  );
}

function storedDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { templateId?: string; draft?: MiddleDraft };
    if (!data.templateId || !data.draft) return null;
    return { templateId: data.templateId, draft: data.draft };
  } catch {
    return null;
  }
}

export function useDemoCoupleReminder(input: {
  ready?: boolean;
  templateId?: string;
  partner1?: string;
  partner2?: string;
  date?: string;
} = {}) {
  const ready = input.ready ?? true;
  const { templateId, partner1, partner2, date } = input;
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!ready) return;
    let id = templateId;
    let draft = id ? { partner1: partner1 ?? "", partner2: partner2 ?? "", date: date ?? "" } : null;
    if (!draft) {
      const stored = storedDraft();
      if (!stored) {
        setShow(false);
        return;
      }
      id = stored.templateId;
      draft = stored.draft;
    }
    const preset = middleTemplates.find((item) => item.id === id);
    setShow(Boolean(preset && draft && isDemoCoupleData(draft, preset)));
  }, [ready, templateId, partner1, partner2, date]);
  return show;
}
