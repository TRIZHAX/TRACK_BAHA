import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: { default: "Baha Tracker", template: "%s · Baha Tracker" },
  description: "Community flood observations and emergency coordination.",
  applicationName: "Baha Tracker"
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b4f78" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider><SiteNav />{children}</ThemeProvider></body></html>;
}
