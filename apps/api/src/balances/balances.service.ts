import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { WalletsService } from "../wallets/wallets.service";
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenBalanceDto } from "./dto/token-balance.dto";
import { AggregatedBalanceDto, TokenSummary } from "./dto/aggregated-balance.dto";
import axios from "axios";

interface TokenInfo {
	chainId: number;
	address: string;
	symbol: string;
	name: string;
	decimals: number;
	logoURI?: string;
	tags?: string[];
	extensions?: {
		website?: string;
		twitter?: string;
		coingeckoId?: string;
	};
}

@Injectable()
export class BalancesService {
	private readonly connection: Connection;
	private readonly coingeckoApi = "https://api.coingecko.com/api/v3";
	private tokenList: TokenInfo[] = [];
	private tokenListLastFetched: number = 0;
	private readonly TOKEN_LIST_URL =
		"https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json";
	private readonly TOKEN_LIST_CACHE_TTL = 3600000; // 1 hour
	private readonly PRICE_CACHE_TTL = 600; // 10 minutes in seconds

	constructor(
		private readonly walletsService: WalletsService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {
		this.connection = new Connection(clusterApiUrl("mainnet-beta"));
		this.fetchTokenList();
	}

	private async fetchTokenList() {
		const now = Date.now();
		if (
			this.tokenList.length === 0 ||
			now - this.tokenListLastFetched > this.TOKEN_LIST_CACHE_TTL
		) {
			try {
				const response = await axios.get(this.TOKEN_LIST_URL);
				if (response.data && response.data.tokens) {
					this.tokenList = response.data.tokens;
					this.tokenListLastFetched = now;
					console.log(`Loaded ${this.tokenList.length} tokens from Solana token list`);
				}
			} catch (error) {
				console.error("Error fetching Solana token list:", error);
			}
		}
	}

	private getTokenInfo(mint: string): TokenInfo | null {
		return this.tokenList.find((token) => token.address === mint) || null;
	}

	async getWalletBalance(id: string, userId: string) {
		const wallet = await this.walletsService.findOne(id, userId);

		if (wallet.network !== "SOLANA") {
			throw new BadRequestException("Only Solana wallets are supported currently");
		}

		try {
			// Validate Solana address
			const publicKey = new PublicKey(wallet.address);

			// Get SOL balance
			const solBalance = await this.getSolBalance(publicKey);

			// Get SPL token balances
			const tokenBalances = await this.getSplTokenBalances(publicKey);

			// Get price data
			const priceData = await this.getPriceData([
				"solana",
				...tokenBalances
					.map((token) =>
						token.coingeckoId ? token.coingeckoId : `solana:${token.mint}`
					)
					.filter(Boolean),
			]);

			// Add price data to SOL balance
			const solUsdValue = solBalance * (priceData["solana"]?.usd || 0);

			// Add price data to token balances
			const tokensWithPrices = tokenBalances.map((token) => {
				const priceId = token.coingeckoId || `solana:${token.mint}`;
				const usdValue = token.amount * (priceData[priceId]?.usd || 0);
				return {
					...token,
					usdValue,
				};
			});

			// Calculate total value
			const totalValue =
				solUsdValue +
				tokensWithPrices.reduce((total, token) => total + (token.usdValue || 0), 0);

			return {
				wallet: {
					id: wallet.id,
					name: wallet.name,
					address: wallet.address,
					network: wallet.network,
				},
				native: {
					symbol: "SOL",
					name: "Solana",
					amount: solBalance,
					usdValue: solUsdValue,
					decimals: 9,
					logoUrl:
						"https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
				},
				tokens: tokensWithPrices,
				totalValue,
			};
		} catch (error: any) {
			if (error.message && error.message.includes("Invalid public key input")) {
				throw new BadRequestException("Invalid Solana wallet address");
			}
			throw error;
		}
	}

	async getAggregatedBalance(userId: string): Promise<AggregatedBalanceDto> {
		// Try to get from cache first
		const cacheKey = `aggregated_balance:${userId}`;
		const cachedData = await this.cacheManager.get<AggregatedBalanceDto>(cacheKey);

		if (cachedData) {
			return cachedData;
		}

		// If not in cache, calculate aggregated balance
		const wallets = await this.walletsService.findAll(userId);

		if (wallets.length === 0) {
			return {
				totalValue: 0,
				walletCount: 0,
				tokens: [],
			};
		}

		// Fetch balances for all wallets
		const balancePromises = wallets.map((wallet) => this.getWalletBalance(wallet.id, userId));
		const balances = await Promise.all(balancePromises);

		// Calculate total value
		const totalValue = balances.reduce((sum, balance) => sum + balance.totalValue, 0);

		// Aggregate tokens
		const tokenMap = new Map<string, TokenSummary>();

		// Add SOL to the token map
		balances.forEach((balance) => {
			const { symbol, name, amount, usdValue, logoUrl } = balance.native;

			if (!tokenMap.has(symbol)) {
				tokenMap.set(symbol, {
					symbol,
					name,
					totalAmount: amount,
					totalUsdValue: usdValue,
					logoUrl,
				});
			} else {
				const existing = tokenMap.get(symbol)!;
				existing.totalAmount += amount;
				existing.totalUsdValue += usdValue;
			}
		});

		// Add other tokens to the token map
		balances.forEach((balance) => {
			balance.tokens.forEach((token) => {
				const symbol = token.symbol || token.mint.substring(0, 6);

				if (!tokenMap.has(symbol)) {
					tokenMap.set(symbol, {
						symbol,
						name: token.name || `Unknown (${symbol})`,
						totalAmount: token.amount,
						totalUsdValue: token.usdValue || 0,
						logoUrl: token.logoUrl,
					});
				} else {
					const existing = tokenMap.get(symbol)!;
					existing.totalAmount += token.amount;
					existing.totalUsdValue += token.usdValue || 0;
				}
			});
		});

		// Convert token map to array and sort by USD value (descending)
		const tokens = Array.from(tokenMap.values()).sort(
			(a, b) => b.totalUsdValue - a.totalUsdValue
		);

		const result: AggregatedBalanceDto = {
			totalValue,
			walletCount: wallets.length,
			tokens,
		};

		// Store in cache for 30 seconds (to avoid recalculating too frequently)
		await this.cacheManager.set(cacheKey, result, 30);

		return result;
	}

	private async getSolBalance(publicKey: PublicKey): Promise<number> {
		const balance = await this.connection.getBalance(publicKey);
		return balance / LAMPORTS_PER_SOL;
	}

	private async getSplTokenBalances(publicKey: PublicKey): Promise<TokenBalanceDto[]> {
		try {
			// Ensure we have the latest token list
			await this.fetchTokenList();

			const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(publicKey, {
				programId: TOKEN_PROGRAM_ID,
			});

			return tokenAccounts.value
				.map((account) => {
					const accountData = account.account.data.parsed.info;
					const mint = accountData.mint;
					const amount = accountData.tokenAmount.uiAmount;
					const decimals = accountData.tokenAmount.decimals;

					// Filter out tokens with zero balance
					if (amount === 0) return null;

					// Get token info from the verified token list
					const tokenInfo = this.getTokenInfo(mint);

					// Filter out tokens not in the official token list
					if (!tokenInfo) return null;

					return {
						mint,
						amount,
						decimals,
						symbol: tokenInfo.symbol,
						name: tokenInfo.name,
						logoUrl: tokenInfo.logoURI,
						coingeckoId: tokenInfo.extensions?.coingeckoId,
					};
				})
				.filter(Boolean as any) as TokenBalanceDto[];
		} catch (error) {
			console.error("Error fetching SPL token balances:", error);
			return [];
		}
	}

	private async getPriceData(ids: string[]): Promise<Record<string, { usd: number }>> {
		try {
			// Try to get from cache first
			const cacheKey = `prices:${ids.sort().join(",")}`;
			const cachedPrices =
				await this.cacheManager.get<Record<string, { usd: number }>>(cacheKey);

			if (cachedPrices) {
				console.log("Using cached price data");
				return cachedPrices;
			}

			console.log("Fetching fresh price data from CoinGecko API");
			// Always use real API call
			const response = await axios.get(`${this.coingeckoApi}/simple/price`, {
				params: {
					ids: ids.join(","),
					vs_currencies: "usd",
				},
			});

			console.log("Received price data:", response.data);
			
			// Cache the price data
			await this.cacheManager.set(cacheKey, response.data, this.PRICE_CACHE_TTL);

			return response.data;
		} catch (error) {
			console.error("Error fetching price data:", error);
			
			// Check if we have any cached prices from before to use as fallback
			const cacheKey = `prices:${ids.sort().join(",")}`;
			const cachedPrices = await this.cacheManager.get<Record<string, { usd: number }>>(cacheKey);
			
			if (cachedPrices) {
				console.log("Using previously cached data as fallback");
				return cachedPrices;
			}
			
			// If no cached data, use more accurate fallback prices
			const fallbackData = { 
				solana: { usd: 148.0 }  // More current SOL price as of March 2025
			};
			
			// Set a short cache for fallback data
			await this.cacheManager.set(cacheKey, fallbackData, 60); // Cache for 1 minute only
			
			return fallbackData;
		}
	}
}
