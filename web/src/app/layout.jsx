import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata = {
  metadataBase: new URL("https://www.cross-post.xyz"),
  title: "Cross-Post — Write once, post everywhere",
  description:
    "Publish, schedule and track your posts across Instagram, TikTok, X, Facebook, LinkedIn, YouTube, Reddit and Telegram from one place.",
  openGraph: {
    title: "Cross-Post — Write once, post everywhere",
    description:
      "Publish, schedule and track your posts across eight social platforms from one place.",
    url: "https://www.cross-post.xyz",
    siteName: "Cross-Post",
    images: ["/images/hero-creator.webp"],
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,400..700,0..100,0..1&family=Hanken+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
