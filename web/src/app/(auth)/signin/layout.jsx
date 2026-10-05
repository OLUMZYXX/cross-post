import { pageMetadata } from "@/config/seo";

export const metadata = pageMetadata({
  title: "Sign in",
  description:
    "Sign in to Cross-Post to publish and schedule posts across all your social platforms.",
  path: "/signin/",
});

export default function SignInLayout({ children }) {
  return children;
}
