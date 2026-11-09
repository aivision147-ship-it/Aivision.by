export const marketingConsentVersion = "2026-11-09";

export type StudioOrder = {
  source: "zakaz" | "publikaciya" | "brief";
  partner1: string;
  partner2?: string;
  email?: string;
  phone?: string;
  weddingDate?: string;
  tier?: string;
  slug?: string;
  note?: string;
  marketing: boolean;
};

export function postStudioOrder(order: StudioOrder) {
  const body = {
    ...order,
    marketing: order.marketing ? 1 : 0,
    consentTextVersion: order.marketing ? marketingConsentVersion : "",
    website: "",
  };
  void fetch("/api/order.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => undefined);
}
