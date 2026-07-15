import { siteConfig } from "@/lib/seo";

/** Identity shown on the legal pages (Impressum / Datenschutzerklärung). */
export const legalIdentity = {
  name: siteConfig.authorName,
  email: siteConfig.email,
  addressLines: ["Hauptstraße 18", "84107 Weihmichl"],
  country: "Deutschland",
} as const;
