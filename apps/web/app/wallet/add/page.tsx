'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AddWalletForm } from '@/app/components/wallet/add-wallet-form';

export default function AddWalletPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('oneport_token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Add New Wallet</h1>
      <div className="flex justify-center">
        <AddWalletForm />
      </div>
    </div>
  );
}