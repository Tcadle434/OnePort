'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { apiClient } from '@/app/lib/api';
import { formatCurrency, shortenAddress } from '@/app/lib/utils';

interface Token {
  mint: string;
  symbol?: string;
  name?: string;
  amount: number;
  usdValue?: number;
  decimals?: number;
  logoUrl?: string;
}

interface WalletBalance {
  wallet: {
    id: string;
    name: string;
    address: string;
    network: string;
  };
  native: {
    symbol: string;
    name: string;
    amount: number;
    usdValue: number;
    decimals: number;
    logoUrl: string;
  };
  tokens: Token[];
  totalValue: number;
}

interface WalletBalanceProps {
  walletId: string;
}

export function WalletBalance({ walletId }: WalletBalanceProps) {
  const router = useRouter();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('oneport_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchBalance = async () => {
      try {
        const data = await apiClient.get<WalletBalance>(`/balances/wallet/${walletId}`, token);
        setBalance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch wallet balance');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [router, walletId]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading balance data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm bg-red-100 border border-red-300 text-red-600 rounded">
        {error}
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="p-4 text-sm bg-yellow-100 border border-yellow-300 text-yellow-600 rounded">
        No balance data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{balance.wallet.name}</h2>
          <p className="text-muted-foreground">{shortenAddress(balance.wallet.address, 8)}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Value</CardTitle>
          <CardDescription>Combined value of all assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(balance.totalValue)}</div>
        </CardContent>
      </Card>

      <h3 className="text-xl font-semibold mt-6">Assets</h3>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
              {balance.native.logoUrl && (
                <img
                  src={balance.native.logoUrl}
                  alt={balance.native.symbol}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {balance.native.name} ({balance.native.symbol})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-medium">{balance.native.amount.toFixed(6)} {balance.native.symbol}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Value</p>
            <p className="font-medium">{formatCurrency(balance.native.usdValue)}</p>
          </div>
        </CardContent>
      </Card>

      {balance.tokens.length > 0 ? (
        <div className="space-y-4">
          {balance.tokens.map((token) => (
            <Card key={token.mint} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                    {token.logoUrl && (
                      <img
                        src={token.logoUrl}
                        alt={token.symbol || token.mint}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {token.name || shortenAddress(token.mint, 6)} {token.symbol ? `(${token.symbol})` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{token.amount.toFixed(6)} {token.symbol || ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Value</p>
                  <p className="font-medium">{token.usdValue ? formatCurrency(token.usdValue) : 'Unknown'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No token balances found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}