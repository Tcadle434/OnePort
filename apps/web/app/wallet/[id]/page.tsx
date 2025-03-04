'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WalletBalance } from '@/app/components/wallet/wallet-balance';

export default function WalletDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('oneport_token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="container mx-auto py-8 px-4">
      <WalletBalance walletId={id} />
    </div>
  );
}