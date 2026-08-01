import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en"],
  defaultLocale: "de",
  // Important: keep URLs explicit for the default locale as well.
  // This avoids losing the `/de` prefix when navigating via anchors/links.
  localePrefix: "always",
  // The locale is already explicit in every URL, so no preference cookie is needed.
  localeCookie: false,
  // Always land on the German default; don't infer the locale from the
  // browser's Accept-Language header. Visitors can still switch to /en.
  localeDetection: false,
});
