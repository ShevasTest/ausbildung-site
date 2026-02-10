import type { MetadataRoute } from "next";

const baseUrl = "https://alex-ausbildung-portfolio.vercel.app";
const projectSlugs = [
  "ki-bewerbungshelfer",
  "mietpreise-tracker",
  "smartchat",
  "devdash",
  "portfolio",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  for (const slug of projectSlugs) {
    pages.push(
      {
        url: `${baseUrl}/projects/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/en/projects/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
    );
  }

  return pages;
}
