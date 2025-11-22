'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/shared/main-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';
import { getTotalUSDCBalance, getUserEarnings } from '@/lib/supabase';
import type { User, UserEarning } from '@/types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export default function WalletPage() {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [earnings, setEarnings] = useState<UserEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Check auth session from localStorage
    const session = getAuthSession();

    if (!session || session.role !== 'data_contributor') {
      router.push('/login');
      return;
    }

    const supabase = createClient();

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.email)
      .single();

    if (!userData || userData.role !== 'data_contributor') {
      router.push('/login');
      return;
    }

    setUser(userData as User);

    // Get balance
    const totalBalance = await getTotalUSDCBalance(userData.id);
    setBalance(totalBalance);

    // Get earnings history
    const earningsData = await getUserEarnings(userData.id);
    setEarnings(earningsData);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <MainLayout userRole="data_contributor" userName={user.email}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Wallet
          </h1>
          <p className="text-gray-600">
            Your earnings and transactions on BioChain
          </p>
        </div>

        {/* Balance Card */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold text-accent">
                  ${balance.toFixed(2)}
                </h2>
                <p className="text-sm text-gray-500 mt-2">USDC</p>
              </div>
              <div className="text-6xl">💰</div>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-violet-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stellar Wallet</p>
                <p className="text-xs font-mono text-gray-800 break-all mt-2">
                  {user.wallet_address || 'Not available'}
                </p>
              </div>
              <div className="text-4xl">🔐</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Your wallet was automatically generated when you signed up with Web3Auth
              </p>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Transactions</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold">{earnings.length}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average Earnings</h3>
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-3xl font-bold">
              ${earnings.length > 0 ? (balance / earnings.length).toFixed(2) : '0.00'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Data Usage</h3>
              <span className="text-2xl">🔬</span>
            </div>
            <p className="text-3xl font-bold">{earnings.length}</p>
            <p className="text-xs text-gray-500 mt-1">Reports generated</p>
          </Card>
        </div>

        {/* Earnings History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Earnings History</h2>

          {earnings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-lg font-semibold mb-2">You don't have any earnings yet</h3>
              <p className="text-gray-600 mb-6">
                Your data will be used when a researcher generates a report matching your profile. You will receive compensation automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning) => (
                <div
                  key={earning.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">💰</span>
                        <div>
                          <h3 className="font-semibold">
                            Earnings from data usage
                          </h3>
                          <p className="text-sm text-gray-600">
                            {format(new Date(earning.created_at), "MMMM d, yyyy 'at' HH:mm", { locale: enUS })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="font-semibold text-accent">
                            +${Number(earning.amount_usdc).toFixed(2)} USDC
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Report ID</p>
                          <p className="font-mono text-xs">
                            {earning.report_id.substring(0, 8)}...
                          </p>
                        </div>
                        {earning.transaction_hash && (
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Transaction Hash</p>
                            <p className="font-mono text-xs truncate">
                              {earning.transaction_hash}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ✓ Completed
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6 bg-violet-50">
            <h3 className="text-lg font-semibold mb-4">How do I earn USDC?</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">1.</span>
                <span>Complete your medical history accurately</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">2.</span>
                <span>Upload your hormonal studies in PDF format</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">3.</span>
                <span>When a researcher generates a report using your data, you receive USDC automatically</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">4.</span>
                <span>Compensation is distributed equitably among all contributors</span>
              </li>
            </ol>
          </Card>

          <Card className="p-6 bg-orange-50">
            <h3 className="text-lg font-semibold mb-4">Wallet Information</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-semibold mb-1">Network:</p>
                <p>Stellar Testnet</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Asset:</p>
                <p>USDC (Circle USD Coin)</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Security:</p>
                <p>Your wallet is securely custodied by Web3Auth</p>
              </div>
              <div className="pt-3 border-t border-orange-200">
                <p className="text-xs text-gray-600">
                  In production, you could withdraw your USDC to any Stellar-compatible wallet
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
