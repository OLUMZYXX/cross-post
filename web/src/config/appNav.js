import { Home, CalendarDays, Send, BarChart3, User, Bell } from "lucide-react";

export const APP_NAV = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Sent", href: "/posts", icon: Send },
  { label: "Stats", href: "/analytics", icon: BarChart3 },
  { label: "Profile", href: "/settings", icon: User },
];

export const SIDEBAR_SECONDARY = [{ label: "Notifications", href: "/notifications", icon: Bell }];

export const BRAND_TAGLINE = "One thought, sent everywhere it should live.";

export function isActivePath(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function userInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function greetingFor(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
