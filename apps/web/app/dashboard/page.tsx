"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WalletList } from "@/app/components/wallet/wallet-list";
import { AggregatedBalance } from "@/app/components/wallet/aggregated-balance";

export default function DashboardPage() {
	const router = useRouter();

	useEffect(() => {
		// Check if user is authenticated
		const token = localStorage.getItem("oneport_token");
		if (!token) {
			router.push("/auth/login");
		}
	}, [router]);

	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-8">Dashboard</h1>
			<AggregatedBalance />
			<WalletList />
		</div>
	);
}
