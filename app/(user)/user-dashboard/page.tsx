'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/shared/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase';
import { getTotalUSDCBalance } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';
import type { User, MedicalHistory, BloodTest } from '@/types';

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [bloodTests, setBloodTests] = useState<BloodTest[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creatingTrustline, setCreatingTrustline] = useState(false);
  const [hasTrustline, setHasTrustline] = useState(false);
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

    // Get user profile
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

    // Get medical history
    const { data: historyData } = await supabase
      .from('medical_history')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    setMedicalHistory(historyData as MedicalHistory | null);

    // Get blood tests
    const { data: testsData } = await supabase
      .from('blood_tests')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    setBloodTests((testsData as BloodTest[]) || []);

    // Get total earnings
    const total = await getTotalUSDCBalance(userData.id);
    setTotalEarnings(total);

    setLoading(false);
  };

  const handleCreateTrustline = async () => {
    // Get private key from session (localStorage)
    const session = getAuthSession();
    if (!session?.privateKey) {
      alert('Private key not found. Please log in again.');
      return;
    }

    setCreatingTrustline(true);

    try {
      const response = await fetch('/api/stellar/create-trustline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privateKey: session.privateKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create trustline');
      }

      setHasTrustline(true);
      alert(`✅ USDC Trustline created successfully!\n\nTransaction: ${data.transactionHash}\n\nYou can now receive USDC payments!`);
    } catch (error: any) {
      console.error('Error creating trustline:', error);
      alert('❌ Error creating USDC trustline. ' + error.message);
    } finally {
      setCreatingTrustline(false);
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

  const needsHistory = !medicalHistory || !medicalHistory.consent_signed;

  return (
    <MainLayout userRole="data_contributor" userName={user.email}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome, {user.email}
          </p>
        </div>

        {/* Alert if medical history incomplete */}
        {needsHistory && (
          <div className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📋</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-orange-900 mb-2">Complete Your Medical History</h3>
                <p className="text-orange-800 mb-4">
                  To upload studies and earn USDC, you need to complete your medical history and sign the consent form.
                </p>
                <Link href="/user-medical-history">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Complete Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Balance Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 mb-2 text-lg">Total Balance in USDC</p>
                <h2 className="text-6xl font-bold mb-3">
                  ${totalEarnings.toFixed(2)}
                </h2>
                <p className="text-orange-100">
                  {bloodTests.length} {bloodTests.length === 1 ? 'study uploaded' : 'studies uploaded'}
                </p>
              </div>
              <div className="text-8xl opacity-20">💰</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border-2 border-violet-100 shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="font-semibold text-gray-600">Studies Uploaded</h3>
            </div>
            <p className="text-4xl font-bold text-violet-600">{bloodTests.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-orange-100 shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">{medicalHistory?.consent_signed ? '✅' : '📋'}</span>
              </div>
              <h3 className="font-semibold text-gray-600">Medical History</h3>
            </div>
            <p className={`text-2xl font-bold ${medicalHistory?.consent_signed ? 'text-green-600' : 'text-orange-600'}`}>
              {medicalHistory?.consent_signed ? 'Complete' : 'Pending'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-violet-100 shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👛</span>
              </div>
              <h3 className="font-semibold text-gray-600">Stellar Wallet</h3>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-mono break-all text-violet-600">
                {user.wallet_address || 'Not available'}
              </p>
              {user.wallet_address && (
                <>
                  <div className="flex gap-2">
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
                  {!hasTrustline && (
                    <button
                      onClick={handleCreateTrustline}
                      disabled={creatingTrustline}
                      className="w-full text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg transition font-semibold disabled:opacity-50"
                    >
                      {creatingTrustline ? '⏳ Creating...' : '💵 Activate USDC Trustline'}
                    </button>
                  )}
                  {hasTrustline && (
                    <div className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded-lg font-semibold text-center">
                      ✅ USDC Trustline Active
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/user-upload">
              <div className={`bg-gradient-to-br from-violet-50 to-violet-100 border-2 border-violet-200 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer ${needsHistory ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-4xl">📤</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-violet-900">Upload Study</h3>
                <p className="text-violet-700 text-lg">
                  Upload your hormonal studies in PDF
                </p>
                {needsHistory && (
                  <p className="text-sm text-orange-600 mt-3 font-semibold">
                    ⚠️ Complete your medical history first
                  </p>
                )}
              </div>
            </Link>

            <Link href="/user-wallet">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-4xl">👛</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-orange-900">My Wallet</h3>
                <p className="text-orange-700 text-lg">
                  View earnings and transactions
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Blood Tests */}
        {bloodTests.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Studies</h2>
            <div className="space-y-4">
              {bloodTests.slice(0, 5).map((test) => (
                <div key={test.id} className="bg-white border-2 border-violet-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center">
                        <span className="text-3xl">🩸</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{test.lab_name || 'Laboratory'}</h3>
                        <p className="text-gray-600">
                          {test.test_date ? new Date(test.test_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not available'}
                        </p>
                      </div>
                    </div>
                    <div>
                      {test.blockchain_hash ? (
                        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                          <span className="text-green-600 font-semibold">✓ Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                          <span className="text-orange-600 font-semibold">⏳ Processing</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-gradient-to-br from-violet-50 to-orange-50 border-2 border-violet-200 rounded-3xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">💡 How do I earn more USDC?</h3>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-white text-lg">1</span>
              </div>
              <p className="text-gray-700 text-lg pt-1">
                Complete your medical history accurately and in detail
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-white text-lg">2</span>
              </div>
              <p className="text-gray-700 text-lg pt-1">
                Upload your hormonal studies in PDF format
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-white text-lg">3</span>
              </div>
              <p className="text-gray-700 text-lg pt-1">
                Receive automatic USDC compensation each time a researcher uses your data
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-white text-lg">4</span>
              </div>
              <p className="text-gray-700 text-lg pt-1">
                Keep your data up to date by uploading new studies regularly
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
