'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('oneport_token');
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('oneport_token');
    localStorage.removeItem('oneport_user');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold">
            OnePort
          </Link>
        </div>

        <nav className="hidden md:flex space-x-4 items-center">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={`hover:text-primary ${pathname === '/dashboard' ? 'text-primary font-medium' : ''}`}>
                Dashboard
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={`hover:text-primary ${pathname === '/auth/login' ? 'text-primary font-medium' : ''}`}>
                Login
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            Menu
          </Button>
        </div>
      </div>
    </header>
  );
}