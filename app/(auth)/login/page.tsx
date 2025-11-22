'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loginWithGoogle } from '@/lib/web3auth';
import { createClient } from '@/lib/supabase';
import { setAuthSession } from '@/lib/auth';
import type { UserRole } from '@/types';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleGoogleLogin = async () => {
    if (!selectedRole) {
      alert('Please select your role first');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting login with role:', selectedRole);

      const data = await loginWithGoogle();
      console.log('Google login successful, email:', data.email);
      console.log('Wallet created:', data.walletAddress);

      // Use Supabase only for database operations, not auth
      const supabase = createClient();

      // Check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.email)
        .single();

      console.log('Existing user check:', existingUser, 'Error:', fetchError);

      let userId;
      let userRole;

      if (existingUser) {
        // User exists - check if they selected a different role
        console.log('User exists with role:', existingUser.role);
        userId = existingUser.id;

        if (existingUser.role !== selectedRole) {
          // User wants to change role - update it
          console.log('User changing role from', existingUser.role, 'to', selectedRole);
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: selectedRole })
            .eq('id', existingUser.id);

          if (updateError) {
            console.error('Error updating user role:', updateError);
            throw updateError;
          }

          // If changing to researcher, create credits
          if (selectedRole === 'researcher') {
            console.log('Creating researcher credits for role change');
            // First check if credits already exist
            const { data: existingCredits } = await supabase
              .from('researcher_credits')
              .select('*')
              .eq('researcher_id', existingUser.id)
              .single();

            if (!existingCredits) {
              await supabase
                .from('researcher_credits')
                .insert({
                  researcher_id: existingUser.id,
                  biochain_balance: 5,
                });
            }
          }
          userRole = selectedRole;
        } else {
          userRole = existingUser.role;
        }
      } else {
        // New user, create with selected role
        console.log('Creating new user with role:', selectedRole);
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            email: data.email,
            role: selectedRole,
            wallet_address: data.walletAddress,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating user:', error);
          throw error;
        }

        console.log('New user created:', newUser);
        userId = newUser.id;
        userRole = selectedRole;

        // If researcher, create initial credits
        if (selectedRole === 'researcher') {
          console.log('Creating researcher credits');
          await supabase
            .from('researcher_credits')
            .insert({
              researcher_id: newUser.id,
              biochain_balance: 5,
            });
        }
      }

      // Set auth session in localStorage (including private key for blockchain transactions)
      setAuthSession(data.email, userRole, data.privateKey);
      console.log('Auth session created in localStorage');

      // Redirect based on selected role
      if (userRole === 'researcher') {
        console.log('Redirecting to researcher dashboard');
        router.push('/researcher-dashboard');
      } else {
        console.log('Redirecting to user dashboard');
        router.push('/user-dashboard');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Error during sign in. Please try again: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent mb-3">
            BioChain
          </h1>
          <p className="text-gray-600 text-xl">
            Select your role to get started
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => handleRoleSelect('researcher')}
            className={`p-8 rounded-3xl border-3 transition-all text-left ${
              selectedRole === 'researcher'
                ? 'border-violet-500 bg-violet-50 shadow-xl scale-105'
                : 'border-violet-200 bg-white hover:border-violet-400 hover:shadow-lg'
            }`}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl mb-4 flex items-center justify-center">
              <span className="text-3xl">🔬</span>
            </div>
            <h3 className="font-bold text-2xl mb-3 text-violet-900">Researcher</h3>
            <p className="text-gray-600 text-lg">
              Access anonymized hormonal data for your medical research
            </p>
            {selectedRole === 'researcher' && (
              <div className="mt-4 flex items-center text-violet-600 font-semibold">
                <span className="text-xl mr-2">✓</span> Selected
              </div>
            )}
          </button>

          <button
            onClick={() => handleRoleSelect('data_contributor')}
            className={`p-8 rounded-3xl border-3 transition-all text-left ${
              selectedRole === 'data_contributor'
                ? 'border-orange-500 bg-orange-50 shadow-xl scale-105'
                : 'border-orange-200 bg-white hover:border-orange-400 hover:shadow-lg'
            }`}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 flex items-center justify-center">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="font-bold text-2xl mb-3 text-orange-900">Data Contributor</h3>
            <p className="text-gray-600 text-lg">
              Share your hormonal studies and receive USDC compensation
            </p>
            {selectedRole === 'data_contributor' && (
              <div className="mt-4 flex items-center text-orange-600 font-semibold">
                <span className="text-xl mr-2">✓</span> Selected
              </div>
            )}
          </button>
        </div>

        {/* Google Login Button */}
        <Card className="p-8 shadow-xl border-violet-100">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading || !selectedRole}
            className={`w-full h-16 text-xl font-semibold transition-all ${
              selectedRole
                ? 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Loading...' : '🔐 Continue with Google'}
          </Button>

          <p className="text-sm text-gray-500 text-center mt-6">
            By continuing, you accept our terms and privacy policy
          </p>
        </Card>
      </div>
    </div>
  );
}
