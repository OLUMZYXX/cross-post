import { SITE } from "@/config/site";

export function pageMetadata({ title, description, path }) {
  const fullTitle = `${title} — ${SITE.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: `${SITE.url}${path}`,
      siteName: SITE.name,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/og-image.png"],
    },
  };
}
