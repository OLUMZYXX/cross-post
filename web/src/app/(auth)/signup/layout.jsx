import { pageMetadata } from "@/config/seo";

export const metadata = pageMetadata({
  title: "Create your account",
  description:
    "Create a free Cross-Post account and post to eight social platforms from one place.",
  path: "/signup/",
});

export default function SignUpLayout({ children }) {
  return children;
}
