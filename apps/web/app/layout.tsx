import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/app/components/ui/navbar";

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
		<html lang="en" className="dark">
			<body
				className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}
			>
				<Navbar />
				<main className="flex-1">{children}</main>
				<footer className="py-6 border-t border-border bg-card">
					<div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
						<p>© {new Date().getFullYear()} OnePort. All rights reserved.</p>
					</div>
				</footer>
			</body>
		</html>
	);
}
