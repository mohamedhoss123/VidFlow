import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "~/components/app-sidebar";
import Header from "~/components/header";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VidFlow",
  description: "A video platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <Header />
          <AppSidebar />
            {children}
      </body>
    </html>
  );
}
