import { siteConfig } from "@/lib/seo";

/**
 * Identity shown on the legal pages (Impressum / Datenschutzerklärung).
 * addressLines: add street and city once confirmed, e.g. ["Musterstraße 1", "10115 Berlin"].
 * Until then the pages render name, country and email only.
 */
export const legalIdentity = {
  name: siteConfig.authorName,
  email: siteConfig.email,
  addressLines: [] as string[],
  country: "Deutschland",
} as const;
