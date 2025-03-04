import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { WalletsService } from '../wallets/wallets.service';
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenBalanceDto } from './dto/token-balance.dto';
import axios from 'axios';

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
  private readonly coingeckoApi = 'https://api.coingecko.com/api/v3';
  private tokenList: TokenInfo[] = [];
  private tokenListLastFetched: number = 0;
  private readonly TOKEN_LIST_URL = 'https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json';
  private readonly TOKEN_LIST_CACHE_TTL = 3600000; // 1 hour

  constructor(private readonly walletsService: WalletsService) {
    this.connection = new Connection(clusterApiUrl('mainnet-beta'));
    this.fetchTokenList();
  }

  private async fetchTokenList() {
    const now = Date.now();
    if (this.tokenList.length === 0 || now - this.tokenListLastFetched > this.TOKEN_LIST_CACHE_TTL) {
      try {
        const response = await axios.get(this.TOKEN_LIST_URL);
        if (response.data && response.data.tokens) {
          this.tokenList = response.data.tokens;
          this.tokenListLastFetched = now;
          console.log(`Loaded ${this.tokenList.length} tokens from Solana token list`);
        }
      } catch (error) {
        console.error('Error fetching Solana token list:', error);
      }
    }
  }

  private getTokenInfo(mint: string): TokenInfo | null {
    return this.tokenList.find(token => token.address === mint) || null;
  }

  async getWalletBalance(id: string, userId: string) {
    const wallet = await this.walletsService.findOne(id, userId);
    
    if (wallet.network !== 'SOLANA') {
      throw new BadRequestException('Only Solana wallets are supported currently');
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
        'solana',
        ...tokenBalances.map(token => 
          token.coingeckoId ? token.coingeckoId : `solana:${token.mint}`
        ).filter(Boolean),
      ]);
      
      // Add price data to SOL balance
      const solUsdValue = solBalance * (priceData['solana']?.usd || 0);
      
      // Add price data to token balances
      const tokensWithPrices = tokenBalances.map(token => {
        const priceId = token.coingeckoId || `solana:${token.mint}`;
        const usdValue = token.amount * (priceData[priceId]?.usd || 0);
        return {
          ...token,
          usdValue,
        };
      });
      
      // Calculate total value
      const totalValue = solUsdValue + tokensWithPrices.reduce((total, token) => total + (token.usdValue || 0), 0);
      
      return {
        wallet: {
          id: wallet.id,
          name: wallet.name,
          address: wallet.address,
          network: wallet.network,
        },
        native: {
          symbol: 'SOL',
          name: 'Solana',
          amount: solBalance,
          usdValue: solUsdValue,
          decimals: 9,
          logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        },
        tokens: tokensWithPrices,
        totalValue,
      };
    } catch (error: any) {
      if (error.message && error.message.includes('Invalid public key input')) {
        throw new BadRequestException('Invalid Solana wallet address');
      }
      throw error;
    }
  }

  private async getSolBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  private async getSplTokenBalances(publicKey: PublicKey): Promise<TokenBalanceDto[]> {
    try {
      // Ensure we have the latest token list
      await this.fetchTokenList();
      
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID },
      );
      
      return tokenAccounts.value
        .map(account => {
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
      console.error('Error fetching SPL token balances:', error);
      return [];
    }
  }

  private async getPriceData(ids: string[]): Promise<Record<string, { usd: number }>> {
    try {
      // Mock price data for development to avoid hitting CoinGecko rate limits
      if (process.env.NODE_ENV === 'development') {
        const mockData: Record<string, { usd: number }> = {
          'solana': { usd: 50.0 }
        };
        ids.forEach(id => {
          if (id !== 'solana') {
            mockData[id] = { usd: 1.0 };
          }
        });
        return mockData;
      }
      
      // Real API call for production
      const response = await axios.get(`${this.coingeckoApi}/simple/price`, {
        params: {
          ids: ids.join(','),
          vs_currencies: 'usd',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching price data:', error);
      return { 'solana': { usd: 50.0 } }; // Fallback price for SOL
    }
  }
}