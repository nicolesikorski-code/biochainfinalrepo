'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/shared/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';
import type { User, ResearcherCredits } from '@/types';

export default function ResearcherDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<ResearcherCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [accountActive, setAccountActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Check auth session from localStorage
    const session = getAuthSession();

    if (!session || session.role !== 'researcher') {
      router.push('/login');
      return;
    }

    const supabase = createClient();

    // Get user profile
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.email)
      .single();

    if (!userData || userData.role !== 'researcher') {
      router.push('/login');
      return;
    }

    setUser(userData as User);

    // Get credits
    const { data: creditsData } = await supabase
      .from('researcher_credits')
      .select('*')
      .eq('researcher_id', userData.id)
      .single();

    setCredits(creditsData as ResearcherCredits);

    // Check if account is active on Stellar
    if (userData.wallet_address) {
      try {
        const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${userData.wallet_address}`);
        setAccountActive(response.ok);
      } catch (e) {
        setAccountActive(false);
      }
    }

    setLoading(false);
  };

  const handleActivateAccount = async () => {
    if (!user?.wallet_address) return;

    setActivating(true);
    try {
      const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(user.wallet_address)}`);

      if (response.ok) {
        alert('✅ Account activated successfully! Your wallet is now ready to receive payments.');
        setAccountActive(true);
      } else {
        throw new Error('Failed to activate account');
      }
    } catch (error) {
      console.error('Error activating account:', error);
      alert('❌ Error activating account. Please try again.');
    } finally {
      setActivating(false);
    }
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
    <MainLayout userRole="researcher" userName={user.email}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Researcher Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome, {user.email}
          </p>
        </div>

        {/* Balance Card */}
        <div className="mb-8 grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">BIOCHAIN Balance</p>
                <h2 className="text-4xl font-bold text-primary">
                  {credits?.biochain_balance || 0}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  1 BIOCHAIN = 1 Report
                </p>
              </div>
              <div className="text-6xl">💎</div>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-violet-50 to-white border-violet-200">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">👛</span>
                <p className="text-sm font-semibold text-gray-600">Stellar Wallet</p>
              </div>
              <p className="text-xs font-mono break-all text-violet-600 mb-3">
                {user.wallet_address || 'Not available'}
              </p>
              {user.wallet_address && (
                <>
                  {!accountActive && (
                    <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                      ⚠️ Account not activated. Click "Activate" to fund your wallet.
                    </div>
                  )}
                  {accountActive && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      ✅ Account active on Stellar Testnet
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {!accountActive && (
                      <button
                        onClick={handleActivateAccount}
                        disabled={activating}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition disabled:opacity-50"
                      >
                        {activating ? '⏳ Activating...' : '⚡ Activate Account'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user.wallet_address || '');
                        alert('Wallet address copied!');
                      }}
                      className="text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-1 rounded-lg transition"
                    >
                      📋 Copy
                    </button>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${user.wallet_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded-lg transition"
                    >
                      🔍 View on Explorer
                    </a>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/researcher-chat">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <Badge>New</Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Chat</h3>
                <p className="text-sm text-gray-600">
                  Define your research criteria with the help of our AI
                </p>
              </Card>
            </Link>

            <Link href="/researcher-reports">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">My Reports</h3>
                <p className="text-sm text-gray-600">
                  Access all the reports you have generated
                </p>
              </Card>
            </Link>

            <Link href="/researcher-credits">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Buy Credits</h3>
                <p className="text-sm text-gray-600">
                  Purchase more BIOCHAIN credits to generate reports
                </p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">How It Works</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">1.</span>
                <span>Use AI Chat to define exactly what data you need</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">2.</span>
                <span>Generate a personalized report (costs 1 BIOCHAIN)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">3.</span>
                <span>Receive aggregated and anonymized data from our database</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">4.</span>
                <span>Women who contributed receive compensation in USDC</span>
              </li>
            </ol>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-white">
            <h3 className="text-lg font-semibold mb-4">Available Data</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="text-accent mr-2">✓</span>
                <span>Hormonal markers (Progesterone, Estrogen, Testosterone, FSH, LH)</span>
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2">✓</span>
                <span>Demographic information (age, BMI, physical activity)</span>
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2">✓</span>
                <span>Hormonal contraceptive use</span>
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2">✓</span>
                <span>Hormonal conditions (PCOS, endometriosis, etc.)</span>
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2">✓</span>
                <span>Data verified on Stellar blockchain</span>
              </li>
            </ul>
          </Card>
        </div>

        {credits && credits.biochain_balance < 3 && (
          <div className="mt-8">
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold mb-1">Low Credits</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    You only have {credits.biochain_balance} credits left. Consider purchasing more to continue generating reports.
                  </p>
                  <Link href="/researcher-credits">
                    <Button variant="outline" size="sm">
                      Buy Credits
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
