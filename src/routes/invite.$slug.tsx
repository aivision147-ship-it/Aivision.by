import { createFileRoute, Link } from "@tanstack/react-router";
import { InviteExperience } from "@/components/invite/experience";
import { getSample } from "@/data/catalog";

export const Route = createFileRoute("/invite/$slug")({
  validateSearch: (search: Record<string, unknown>): { embed?: boolean } => {
    if (search.embed === "1" || search.embed === 1 || search.embed === true) return { embed: true };
    return {};
  },
  loader: ({ params }) => getSample(params.slug),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.names[0]} и ${loaderData.names[1]} — образец AIVISION STUDIO`
          : "Образец не найден — AIVISION STUDIO",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: InviteRoute,
});

function InviteRoute() {
  const sample = Route.useLoaderData();
  const { embed } = Route.useSearch();
  if (!sample) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-6">
        <h1 className="font-serif text-5xl">Такого образца нет</h1>
        <Link to="/" className="text-burgundy underline">
          Вернуться в ателье
        </Link>
      </main>
    );
  }
  return <InviteExperience key={sample.slug} sample={sample} embed={embed} />;
}
