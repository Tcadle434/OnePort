import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { WalletsService } from '../wallets/wallets.service';
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenBalanceDto } from './dto/token-balance.dto';
import axios from 'axios';

@Injectable()
export class BalancesService {
  private readonly connection: Connection;
  private readonly coingeckoApi = 'https://api.coingecko.com/api/v3';

  constructor(private readonly walletsService: WalletsService) {
    this.connection = new Connection(clusterApiUrl('mainnet-beta'));
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
        ...tokenBalances.map(token => `solana:${token.mint}`),
      ]);
      
      // Add price data to SOL balance
      const solUsdValue = solBalance * (priceData['solana']?.usd || 0);
      
      // Add price data to token balances
      const tokensWithPrices = tokenBalances.map(token => {
        const tokenId = `solana:${token.mint}`;
        const usdValue = token.amount * (priceData[tokenId]?.usd || 0);
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
          
          return {
            mint,
            amount,
            decimals,
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