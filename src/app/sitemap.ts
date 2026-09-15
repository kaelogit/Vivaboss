import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { shopCategories } from "@/lib/navigation";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl;
  const now = new Date();

  const staticRoutes = [
    "",
    "/shop",
    "/services",
    "/services/home",
    "/services/smart-home",
    "/services/book",
    "/courier",
    "/courier/book",
    "/about",
    "/contact",
    "/faq",
    "/reviews",
    "/cart",
    "/order/track",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const categories = shopCategories.map((c) => ({
    url: `${base}${c.href}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categories];
}
