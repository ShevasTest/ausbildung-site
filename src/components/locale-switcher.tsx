"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const locales = ["de", "en"] as const;
type AppLocale = (typeof locales)[number];

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (nextLocale: AppLocale) => {
    router.replace(pathname, { locale: nextLocale });
  };

  const switcherLabel = locale === "de" ? "Sprache auswählen" : "Select language";

  return (
    <div
      role="group"
      aria-label={switcherLabel}
      className="inline-flex items-center rounded-full border border-border bg-card p-1 text-xs font-medium"
    >
      {locales.map((option) => {
        const isActive = option === locale;
        const optionLabel =
          option === "de"
            ? locale === "de"
              ? "Deutsch"
              : "German"
            : locale === "de"
              ? "Englisch"
              : "English";

        return (
          <button
            key={option}
            type="button"
            onClick={() => switchLocale(option)}
            className={`rounded-full px-2.5 py-1 transition ${
              isActive
                ? "bg-primary-solid text-white"
                : "text-muted hover:text-foreground"
            }`}
            aria-pressed={isActive}
            aria-label={optionLabel}
            title={optionLabel}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
