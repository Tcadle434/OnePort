export class TokenBalanceDto {
  mint: string;
  symbol?: string;
  name?: string;
  amount: number;
  usdValue?: number;
  decimals?: number;
  logoUrl?: string;
  coingeckoId?: string;
}