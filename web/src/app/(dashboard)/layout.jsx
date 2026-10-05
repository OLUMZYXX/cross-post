import AppShell from "@/components/layout/AppShell";

export const metadata = {
  title: { default: "Crosspost", template: "%s · Crosspost" },
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function DashboardLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
