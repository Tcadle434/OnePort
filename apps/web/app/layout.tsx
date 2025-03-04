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
		<html lang="en" className="dark">
			<body
				className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}
			>
				<header className="border-b border-border bg-card">
					<div className="container mx-auto flex justify-between items-center h-16 px-4">
						<div className="flex items-center">
							<a href="/" className="text-2xl font-bold">
								<span className="text-primary">One</span>Port
							</a>
						</div>
						<nav className="hidden md:flex items-center space-x-6">
							<a href="/auth/login" className="hover:text-primary transition-colors">
								Login
							</a>
							<a
								href="/auth/register"
								className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-primary-foreground transition-colors"
							>
								Get Started
							</a>
						</nav>
					</div>
				</header>
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
