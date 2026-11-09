import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/katalog")({
  beforeLoad: () => {
    throw redirect({ to: "/shablony", statusCode: 301 });
  },
});
