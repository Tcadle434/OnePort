"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { apiClient } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface TokenSummary {
	symbol: string;
	name: string;
	totalAmount: number;
	totalUsdValue: number;
	logoUrl?: string;
}

interface AggregatedBalance {
	totalValue: number;
	walletCount: number;
	tokens: TokenSummary[];
}

// Define pastel colors for the pie chart
const COLORS = [
  '#94D2FF', '#9BE7D8', '#FFE8A8', '#FFBEA3', '#CBBEFF', 
  '#C2F0D2', '#C1E6ED', '#DEF2C2', '#E3F4AF', '#F9D2DF'
];

// Custom tooltip for the pie chart
const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-white p-3 rounded shadow-md border">
				<p className="font-semibold text-black">{data.name}</p>
				<p className="text-sm font-medium text-black">{formatCurrency(data.value)}</p>
				<p className="text-sm font-medium text-gray-700">{data.percent.toFixed(1)}% of portfolio</p>
			</div>
		);
	}
	return null;
};

// Portfolio allocation chart component
const PortfolioAllocationChart = ({ tokens, totalValue }: { tokens: TokenSummary[], totalValue: number }) => {
	// Prepare data for the pie chart - limit to top 9 tokens and group the rest as "Other"
	const prepareChartData = () => {
		// Only use tokens with value
		const validTokens = tokens.filter(token => token.totalUsdValue > 0);
		if (validTokens.length === 0) return [];
		
		// If 9 or fewer tokens, use them all
		if (validTokens.length <= 9) {
			return validTokens.map(token => ({
				name: token.name,
				symbol: token.symbol,
				value: token.totalUsdValue,
				percent: (token.totalUsdValue / totalValue) * 100
			}));
		}
		
		// Otherwise, take top 8 and group the rest as "Other"
		const topTokens = validTokens.slice(0, 8);
		const otherTokens = validTokens.slice(8);
		const otherValue = otherTokens.reduce((sum, token) => sum + token.totalUsdValue, 0);
		
		return [
			...topTokens.map(token => ({
				name: token.name,
				symbol: token.symbol,
				value: token.totalUsdValue,
				percent: (token.totalUsdValue / totalValue) * 100
			})),
			{
				name: "Other",
				symbol: "OTHER",
				value: otherValue,
				percent: (otherValue / totalValue) * 100
			}
		];
	};
	
	const chartData = prepareChartData();
	
	// Custom legend for the pie chart
	const renderLegend = (props: any) => {
		const { payload } = props;
		return (
			<ul className="text-xs mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
				{payload.map((entry: any, index: number) => (
					<li key={`item-${index}`} className="flex items-center">
						<div
							className="w-3 h-3 rounded-full mr-1"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="truncate">{entry.value}</span>
					</li>
				))}
			</ul>
		);
	};
	
	// If no data, don't render the chart
	if (chartData.length === 0) return null;
	
	return (
		<ResponsiveContainer width="100%" height="100%">
			<PieChart>
				<Pie
					data={chartData}
					cx="50%"
					cy="50%"
					innerRadius={60}
					outerRadius={100}
					paddingAngle={1}
					dataKey="value"
					nameKey="name"
					label={({ name, percent }) => `${name} ${percent.toFixed(0)}%`}
					labelLine={false}
				>
					{chartData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
					))}
				</Pie>
				<Tooltip content={<CustomTooltip />} />
				<Legend content={renderLegend} />
			</PieChart>
		</ResponsiveContainer>
	);
};

export function AggregatedBalance() {
	const router = useRouter();
	const [balance, setBalance] = useState<AggregatedBalance | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem("oneport_token");
		if (!token) {
			router.push("/auth/login");
			return;
		}

		const fetchAggregatedBalance = async () => {
			try {
				const data = await apiClient.get<AggregatedBalance>("/balances/aggregate", token);
				setBalance(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch aggregated balance");
			} finally {
				setLoading(false);
			}
		};

		fetchAggregatedBalance();
	}, [router]);

	if (loading) {
		return <div className="flex justify-center p-4">Loading portfolio summary...</div>;
	}

	if (error) {
		return (
			<div className="p-4 text-sm bg-red-100 border border-red-300 text-red-600 rounded">
				{error}
			</div>
		);
	}

	if (!balance || balance.walletCount === 0) {
		return null;
	}

	// Only show top 5 tokens in the summary
	const topTokens = balance.tokens.slice(0, 5);

	return (
		<Card className="mb-8">
			<CardHeader>
				<CardTitle>Portfolio Summary</CardTitle>
				<CardDescription>
					Aggregated balance across {balance.walletCount} wallet
					{balance.walletCount !== 1 ? "s" : ""}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-4">
					<h3 className="text-lg font-medium mb-2">Total Value</h3>
					<div className="text-3xl font-bold">{formatCurrency(balance.totalValue)}</div>
				</div>

				{topTokens.length > 0 && (
					<div className="flex flex-col md:flex-row gap-6">
						<div className="w-full md:w-1/2">
							<h3 className="text-lg font-medium mb-2">Top Assets</h3>
							<div className="space-y-3">
								{topTokens.map((token) => (
									<div
										key={token.symbol}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											{token.logoUrl && (
												<div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
													<img
														src={token.logoUrl}
														alt={token.symbol}
														className="w-full h-full object-cover"
													/>
												</div>
											)}
											<div>
												<div className="font-medium">{token.name}</div>
												<div className="text-sm text-muted-foreground">
													{token.totalAmount.toFixed(4)} {token.symbol}
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="font-medium">
												{formatCurrency(token.totalUsdValue)}
											</div>
											<div className="text-sm text-muted-foreground">
												{(
													(token.totalUsdValue / balance.totalValue) *
													100
												).toFixed(1)}
												%
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
						
						<div className="w-full md:w-1/2">
							<h3 className="text-lg font-medium mb-2">Portfolio Allocation</h3>
							<div className="h-[300px] w-full">
								<PortfolioAllocationChart tokens={balance.tokens} totalValue={balance.totalValue} />
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}