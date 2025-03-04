export class TokenSummary {
	symbol: string;
	name: string;
	totalAmount: number;
	totalUsdValue: number;
	logoUrl?: string;
}

export class AggregatedBalanceDto {
	totalValue: number;
	walletCount: number;
	tokens: TokenSummary[];
}
