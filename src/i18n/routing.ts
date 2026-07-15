import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en"],
  defaultLocale: "de",
  // Important: keep URLs explicit for the default locale as well.
  // This avoids losing the `/de` prefix when navigating via anchors/links.
  localePrefix: "always",
  // The locale is already explicit in every URL, so no preference cookie is needed.
  localeCookie: false,
});
