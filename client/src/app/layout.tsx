import type { Metadata } from "next";
import {Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/provider/ThemeProvider.component";
import { QueryClientProvider } from "@/components/provider/QueryClient.component";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CortexAI",
  description: "Your AI-powered assistant for smarter work and life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} antialiased`}
      >
        <QueryClientProvider>
          <Toaster/>
          <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "purple"]} enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
