import type { ReactNode } from "react";
import { legalLinks, site, company, whatsappHref } from "@/lib/site";

const pageRows = [
  [
    { href: "/shablony", title: "Шаблоны" },
    { href: "/portfolio", title: "Работы под ключ" },
    { href: "/o-nas", title: "О нас" },
  ],
  [
    { href: "/tarify", title: "Тарифы" },
    { href: "/kontakty", title: "Контакты" },
  ],
] as const;

const documents = legalLinks.filter(
  (item) => !pageRows.some((row) => row.some((link) => link.href === item.href)),
);

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-10">
          <div>
            <p className="font-serif text-2xl whitespace-nowrap wordmark">AiVISION STUDIO</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              Сайт-приглашение на свадьбу по всей Беларуси.
            </p>
          </div>
          <nav aria-label="Страницы" className="text-center">
            <p className="text-xs tracking-label text-burgundy uppercase">Страницы</p>
            <div className="mt-3 flex flex-col items-center gap-2">
              {pageRows.map((row) => (
                <ul key={row[0].href} className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                  {row.map((item) => (
                    <li key={item.href}>
                      <a className="text-sm text-ink hover:text-burgundy" href={item.href}>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </nav>
          <div>
            <p className="text-xs tracking-label text-burgundy uppercase">Связь</p>
            <div className="mt-3 flex gap-2.5">
              <IconLink href={`tel:${site.phone}`} label={`Позвонить ${site.phoneDisplay}`}>
                <PhoneIcon />
              </IconLink>
              <IconLink href={`mailto:${site.email}`} label={`Почта ${site.email}`}>
                <MailIcon />
              </IconLink>
              <IconLink href={whatsappHref()} label="WhatsApp">
                <WhatsAppIcon />
              </IconLink>
              <IconLink href={site.viber} label="Viber">
                <ViberIcon />
              </IconLink>
              <IconLink href={site.telegram} label="Telegram">
                <TelegramIcon />
              </IconLink>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-5">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {documents.map((item) => (
              <li key={item.href}>
                <a className="text-xs text-muted hover:text-ink" href={item.href}>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            {company.name}, УНП {company.unp}. Юридический адрес и банковские реквизиты будут указаны до включения оплаты.
          </p>
          <p className="mt-2 text-xs text-muted">© 2026 aivision.by</p>
        </div>
      </div>
    </footer>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-cream text-burgundy transition hover:border-burgundy hover:bg-burgundy hover:text-cream"
    >
      {children}
    </a>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.2 3.8h2.1l1.2 3-1.5.9a12.5 12.5 0 0 0 5.3 5.3l.9-1.5 3 1.2v2.1c0 .7-.6 1.4-1.4 1.4A14.2 14.2 0 0 1 5.8 5.2c0-.8.6-1.4 1.4-1.4z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M12.04 3.2a8.7 8.7 0 0 0-7.48 13.1L3.4 20.6l4.42-1.12a8.7 8.7 0 0 0 4.22 1.08h.01a8.72 8.72 0 0 0 0-17.36zm0 15.94h-.01a7.2 7.2 0 0 1-3.67-.99l-.26-.15-2.62.66.68-2.55-.17-.27a7.22 7.22 0 1 1 6.05 3.3zm3.96-5.4c-.22-.11-1.28-.63-1.48-.7-.2-.07-.34-.11-.49.11-.14.22-.56.7-.69.84-.13.15-.25.16-.47.05-.22-.11-.92-.34-1.75-1.08-.65-.58-1.08-1.29-1.21-1.51-.13-.22-.01-.34.1-.45.1-.1.22-.25.33-.38.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.05-.11-.49-1.18-.67-1.62-.18-.43-.36-.37-.49-.37h-.42c-.15 0-.39.06-.59.28-.2.22-.78.76-.78 1.85s.8 2.15.91 2.3c.11.15 1.57 2.4 3.8 3.36.53.23.95.37 1.27.47.53.17 1.02.15 1.4.09.43-.06 1.28-.52 1.46-1.03.18-.5.18-.94.13-1.03-.05-.09-.2-.14-.42-.25z" />
    </svg>
  );
}

function ViberIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M12.2 3.1c-1.9.1-3.7.7-4.6 1.5-.7.6-1.3 1.6-1.5 2.6-.3 1.5-.2 3.4.4 5.3.5 1.6 1.3 3 2.2 4 .4.4.7.5 1.1.2.5-.4 1-.9 1.3-1.2.3-.3.5-.4.8-.2.7.4 1.5.7 2.3.8.5.1.8-.1 1-.4.3-.5.8-1.3 1-1.6.2-.4.5-.4.8-.3 1.1.4 1.8.5 2.2.5.6 0 1.1-.5 1.2-1.1.2-1.6-.4-3.6-1.5-5.1-1.2-1.6-2.9-2.8-4.8-3.4-.8-.2-1.4-.3-1.9-.3-.1 0 0 0 0 0zM8.6 5.4c.7-.6 2.2-1.1 3.7-1.2 1.6-.1 3.3.4 4.6 1.4 1.5 1.2 2.4 2.8 2.5 4.4 0 .2-.2.4-.5.4-.3 0-.8-.1-1.6-.4-.6-.2-1.3-.1-1.7.6-.2.4-.7 1.1-1 1.6-.2.2-.3.2-.5.1-.9-.2-1.8-.5-2.6-1-.4-.2-.5-.4-.3-.8.3-.4.7-.9.9-1.3.2-.4.1-.7-.2-.9-.6-.5-1.1-1.2-1.3-1.6-.3-.5-.7-.7-1.2-.6-.6.1-1.3.6-1.6 1.1-.4.6-.5 1.5-.4 2.4.2 1.5.8 2.9 1.6 4 .3.4.2.7-.1 1-.5.4-1 .9-1.5 1.2-.3.2-.6.1-.9-.2-.8-.9-1.5-2.1-1.9-3.4-.6-1.7-.7-3.3-.4-4.5.2-.8.6-1.5 1.2-2z" />
      <path d="M9.2 8.6c.2 0 .3.1.4.3.2.5.7 1.1 1.2 1.5.2.2.2.4 0 .6-.3.3-.5.7-.7 1-.1.2 0 .4.2.6.7.4 1.5.7 2.3.8.2 0 .4-.1.5-.3.2-.4.6-1 .9-1.3.2-.2.4-.2.6-.1.7.3 1.2.4 1.4.4.2 0 .3.2.3.4 0 .8-.6 1.6-1.4 2.1-1 .6-2.2.7-3.3.2a9 9 0 0 1-3.4-2.6 8.2 8.2 0 0 1-1.6-3.2c-.2-1.1.1-2.2.8-2.8.4-.3.8-.5 1.3-.5.1 0 .2 0 .5.1z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M20.7 4.4 3.9 10.8c-1.1.4-1.1 1.1-.2 1.4l4.3 1.3 1.7 5.2c.2.6.1.8.7.8.4 0 .6-.2.8-.4l2.4-2.3 4.5 3.3c.8.5 1.4.2 1.6-.8l2.9-13.5c.3-1.2-.4-1.7-1.9-1.4zM9.6 13.6l8.8-5.5c.4-.3.8-.1.5.2l-7.5 6.8-.3 3.2-1.5-4.7z" />
    </svg>
  );
}
