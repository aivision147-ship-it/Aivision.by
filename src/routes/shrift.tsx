import { createFileRoute } from "@tanstack/react-router";
import { DocPage, Block } from "@/components/studio/doc-page";

export const Route = createFileRoute("/shrift")({
  head: () => ({
    meta: [
      { title: "Шрифты и лицензии — AIVISION STUDIO" },
      { name: "description", content: "Шрифты конструктора AIVISION STUDIO и их лицензии: SIL Open Font License и X11." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://aivision.by/shrift" }],
  }),
  component: FontsPage,
});

const pairs = [
  "Great Vibes и Cormorant Garamond",
  "Great Vibes и Montserrat",
  "Miama Nueva и EB Garamond",
  "Miama Nueva и Raleway",
  "Bad Script и Playfair Display",
  "Bad Script и Lora",
  "Marck Script и Philosopher",
  "Magnolia Script и Montserrat",
  "Magnolia Script и Lora",
  "Russkopis и Prata",
];

function FontsPage() {
  return (
    <DocPage kicker="Шрифты" title="Шрифты и лицензии">
      <Block title="Что стоит на приглашении">
        <p>В конструкторе Middle десять пар. На опубликованный сайт пары попадают только два файла выбранной пары, не все сразу.</p>
        <ul className="mt-3 list-disc pl-5">
          {pairs.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </Block>
      <Block title="Лицензии">
        <p>Начертания, кроме Russkopis, распространяются по SIL Open Font License 1.1. Russkopis — по лицензии X11. Файлы урезаны до латиницы и кириллицы, включая белорусские Ў и І, и по требованию OFL названы с приставкой AIV. Это не продажа шрифтов и не передача исключительных прав.</p>
        <p>Свой шрифт пара может загрузить только если отметит, что имеет право его использовать. Чужой файл в общую библиотеку не попадает.</p>
      </Block>
    </DocPage>
  );
}
