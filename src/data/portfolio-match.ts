import { portfolio, type PortfolioWork } from "@/data/portfolio";
import { showcase } from "@/data/showcase";
import type { StyleTag } from "@/data/style-tags";

export function relatedWorks(work: PortfolioWork, limit = 3) {
  return portfolio
    .filter((item) => item.slug !== work.slug && item.styleTags.some((tag) => work.styleTags.includes(tag)))
    .slice(0, limit);
}

export function worksForTemplate(tags: StyleTag[], limit = 3) {
  const matched = portfolio.filter((item) => item.styleTags.some((tag) => tags.includes(tag)));
  if (matched.length > 0) return matched.slice(0, limit);
  return portfolio.filter((item) => item.tier === "lux").slice(-limit);
}

export function templatesForWork(tags: StyleTag[], limit = 3) {
  return showcase.filter((item) => item.styleTags.some((tag) => tags.includes(tag))).slice(0, limit);
}

export function wantHref(work: Pick<PortfolioWork, "tier" | "styleTags" | "slug">) {
  const params = new URLSearchParams({
    tier: work.tier,
    style: work.styleTags[0] ?? "classic",
    ref: work.slug,
  });
  return `/brief?${params.toString()}`;
}
