import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "basku",
  description: "Grocery lists and recipes, together.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
