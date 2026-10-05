import { SITE } from "@/config/site";

export const dynamic = "force-static";

export default function manifest() {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/dashboard/",
    display: "standalone",
    background_color: "#f6f4ee",
    theme_color: "#022c22",
    icons: [
      { src: "/icon.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" },
    ],
  };
}
