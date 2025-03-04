import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "OnePort - Crypto Portfolio Tracker",
  description: "Track your crypto portfolios in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
        <header className="border-b">
          <div className="container mx-auto flex justify-between items-center h-16 px-4">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold">
                OnePort
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="py-6 border-t">
          <div className="container mx-auto px-4 text-center text-sm">
            <p>© {new Date().getFullYear()} OnePort. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
