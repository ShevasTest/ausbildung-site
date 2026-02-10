import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

const projectSlugs = [
  "ki-bewerbungshelfer",
  "mietpreise-tracker",
  "smartchat",
  "devdash",
  "portfolio",
];

const locales = ["de", "en"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${siteConfig.baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: locale === "de" ? 1 : 0.9,
  }));

  for (const slug of projectSlugs) {
    for (const locale of locales) {
      pages.push({
        url: `${siteConfig.baseUrl}/${locale}/projects/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return pages;
}
