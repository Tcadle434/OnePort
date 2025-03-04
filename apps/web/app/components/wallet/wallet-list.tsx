'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { apiClient } from '@/app/lib/api';
import { shortenAddress } from '@/app/lib/utils';

interface Wallet {
  id: string;
  name: string;
  address: string;
  network: string;
  createdAt: string;
}

export function WalletList() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('oneport_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchWallets = async () => {
      try {
        const data = await apiClient.get<Wallet[]>('/wallets', token);
        setWallets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch wallets');
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading wallets...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm bg-red-100 border border-red-300 text-red-600 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Wallets</h2>
        <Button onClick={() => router.push('/wallet/add')}>Add Wallet</Button>
      </div>

      {wallets.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-6">
              <p className="mb-4 text-muted-foreground">
                You don&apos;t have any wallets yet.
              </p>
              <Button onClick={() => router.push('/wallet/add')}>
                Add Your First Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{wallet.name}</CardTitle>
                <CardDescription>
                  {shortenAddress(wallet.address)} ({wallet.network})
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <span className="text-xs text-muted-foreground">
                  Added on {new Date(wallet.createdAt).toLocaleDateString()}
                </span>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm">
                  Copy Address
                </Button>
                <Link href={`/wallet/${wallet.id}`}>
                  <Button size="sm">View Balance</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}