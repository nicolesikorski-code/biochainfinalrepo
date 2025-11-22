'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/web3auth';
import { clearAuthSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';

interface MainLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  userName?: string;
}

export function MainLayout({ children, userRole, userName }: MainLayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      clearAuthSession(); // Clear localStorage session
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold text-primary cursor-pointer">BioChain</h1>
          </Link>

          <nav className="flex gap-6 items-center">
            {userRole === 'researcher' ? (
              <>
                <Link
                  href="/researcher-dashboard"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/researcher-chat"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  AI Chat
                </Link>
                <Link
                  href="/researcher-reports"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Reports
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/user-dashboard"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/user-upload"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Upload Study
                </Link>
                <Link
                  href="/user-wallet"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Wallet
                </Link>
              </>
            )}

            {userName && (
              <span className="text-sm text-gray-600">
                {userName}
              </span>
            )}

            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>BioChain - Secure and private hormonal data on blockchain</p>
        </div>
      </footer>
    </div>
  );
}
