import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/skoro")({
  head: () => ({
    meta: [
      { title: "Приглашение скоро будет готово — AIVISION STUDIO" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SoonPage,
});

function SoonPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-6 text-center">
      <p className="text-xs tracking-wide text-muted uppercase">aivision.by</p>
      <h1 className="font-serif text-5xl">Приглашение скоро будет готово</h1>
      <p className="text-sm text-muted">Эту страницу видит гость, пока пара не оплатила публикацию. Ссылка для гостей до оплаты не открывает сам сайт.</p>
      <Link to="/" className="text-burgundy underline">На главную</Link>
    </main>
  );
}
