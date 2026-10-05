import { SITE, PUBLIC_ROUTES } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap() {
  const lastModified = new Date();
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
