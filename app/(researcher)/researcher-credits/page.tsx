'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/shared/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';
import type { User, ResearcherCredits } from '@/types';

const CREDIT_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic Package',
    credits: 5,
    price: 50,
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard Package',
    credits: 15,
    price: 135,
    popular: true,
    savings: '10% discount',
  },
  {
    id: 'premium',
    name: 'Premium Package',
    credits: 50,
    price: 400,
    popular: false,
    savings: '20% discount',
  },
];

export default function CreditsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<ResearcherCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<typeof CREDIT_PACKAGES[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer' | null>(null);
  const [processing, setProcessing] = useState(false);
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

    const { data: creditsData } = await supabase
      .from('researcher_credits')
      .select('*')
      .eq('researcher_id', userData.id)
      .single();

    setCredits(creditsData as ResearcherCredits);
    setLoading(false);
  };

  const handleSelectPackage = (pkg: typeof CREDIT_PACKAGES[0]) => {
    setSelectedPackage(pkg);
    setShowCheckout(true);
    setPaymentMethod(null);
  };

  const handleConfirmPayment = async () => {
    if (!user || !credits || !selectedPackage || !paymentMethod) return;

    setProcessing(true);

    try {
      // Simular procesamiento de pago (mock)
      console.log(`Mock payment: ${paymentMethod} for $${selectedPackage.price}`);

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update credits in database
      const supabase = createClient();
      const newBalance = credits.biochain_balance + selectedPackage.credits;

      const { error } = await supabase
        .from('researcher_credits')
        .update({
          biochain_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('researcher_id', user.id);

      if (error) throw error;

      // Update local state
      setCredits({ ...credits, biochain_balance: newBalance });

      // Close modal and reset
      setShowCheckout(false);
      setSelectedPackage(null);
      setPaymentMethod(null);

      alert(`✅ Payment processed successfully! ${selectedPackage.credits} BIOCHAIN have been added to your account.`);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('❌ Error processing payment. Please try again.');
    } finally {
      setProcessing(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            BIOCHAIN Credits
          </h1>
          <p className="text-gray-600">
            Purchase credits to generate reports with anonymized hormonal data
          </p>
        </div>

        {/* Current Balance */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Balance</p>
              <h2 className="text-5xl font-bold text-primary">
                {credits?.biochain_balance || 0}
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                BIOCHAIN available
              </p>
            </div>
            <div className="text-7xl">💎</div>
          </div>
        </Card>

        {/* Packages */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Available Packages</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-8 relative ${
                  pkg.popular ? 'border-2 border-accent shadow-lg' : ''
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute top-4 right-4 bg-accent">
                    Most Popular
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">💎</div>
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  {pkg.savings && (
                    <Badge variant="outline" className="mb-2">
                      {pkg.savings}
                    </Badge>
                  )}
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {pkg.credits}
                  </div>
                  <p className="text-sm text-gray-600">BIOCHAIN Credits</p>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-1">
                    ${pkg.price}
                  </div>
                  <p className="text-sm text-gray-600">
                    ${(pkg.price / pkg.credits).toFixed(2)} per credit
                  </p>
                </div>

                <Button
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full ${
                    pkg.popular ? 'bg-accent hover:bg-accent/90' : ''
                  }`}
                  size="lg"
                >
                  Buy Now
                </Button>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-600 text-center">
                    = {pkg.credits} complete reports
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">What's included in each report?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Aggregated and anonymized hormonal data</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Demographic information from participants</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Relevant medical context (contraceptive use, conditions, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Averages and statistics of hormonal markers</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Blockchain verification of data integrity</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-violet-50">
            <h3 className="text-lg font-semibold mb-4">Purchase Process</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">1.</span>
                <span>Select the package that best fits your needs</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">2.</span>
                <span>Credits are added instantly to your account</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">3.</span>
                <span>Use the AI Chat to define your criteria</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">4.</span>
                <span>Generate reports (1 BIOCHAIN = 1 report)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">5.</span>
                <span>Contributors receive $30 USDC for each report</span>
              </li>
            </ol>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Do credits expire?</p>
              <p className="text-gray-600">
                No, BIOCHAIN credits have no expiration date. You can use them whenever you need.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Can I get a refund?</p>
              <p className="text-gray-600">
                Credits are non-refundable once purchased, but you can use them at any time to generate reports.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">How is data quality guaranteed?</p>
              <p className="text-gray-600">
                All studies are verified, hashes are on the Stellar blockchain, and only data from women who completed their medical history and signed consent is included.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Is the data completely anonymous?</p>
              <p className="text-gray-600">
                Yes, all personally identifiable information is removed through CVM technology. You only receive aggregated hormonal data and anonymized medical context.
              </p>
            </div>
          </div>
        </Card>

        {/* Checkout Modal */}
        {showCheckout && selectedPackage && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full p-8 bg-white shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Checkout</h2>

              {/* Package Summary */}
              <div className="bg-violet-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-lg mb-2">{selectedPackage.name}</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Credits:</span>
                  <span className="font-bold">{selectedPackage.credits} BIOCHAIN</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span className="text-violet-600">${selectedPackage.price} USD</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Select Payment Method:</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('mercadopago')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      paymentMethod === 'mercadopago'
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Mercado Pago</p>
                        <p className="text-sm text-gray-600">Credit/Debit Card</p>
                      </div>
                      {paymentMethod === 'mercadopago' && (
                        <span className="text-violet-600 text-xl">✓</span>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      paymentMethod === 'transfer'
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Bank Transfer</p>
                        <p className="text-sm text-gray-600">Direct bank deposit</p>
                      </div>
                      {paymentMethod === 'transfer' && (
                        <span className="text-violet-600 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCheckout(false);
                    setSelectedPackage(null);
                    setPaymentMethod(null);
                  }}
                  disabled={processing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={!paymentMethod || processing}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {processing ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </div>

              {processing && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
                  <p className="text-sm text-gray-600 mt-2">
                    Processing {paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'bank transfer'} payment...
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
