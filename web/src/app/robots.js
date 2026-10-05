import { SITE, PRIVATE_PATHS } from "@/config/site";

export const dynamic = "force-static";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
