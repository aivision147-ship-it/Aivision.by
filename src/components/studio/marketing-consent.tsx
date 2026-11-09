import { Link } from "@tanstack/react-router";

export function MarketingConsent({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        Согласен(на) получать новости и предложения AIVISION STUDIO на почту и в мессенджеры.{" "}
        <Link to="/privacy" className="underline" target="_blank">Политика</Link>
      </span>
    </label>
  );
}
