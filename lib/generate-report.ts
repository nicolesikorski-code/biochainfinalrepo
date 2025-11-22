import { createClient } from '@/lib/supabase';
import type { Report } from '@/types';
import { consumeBIOCHAINAndDistributeUSDC } from '@/lib/stellar';

export async function generateReport(researcherId: string, query: string): Promise<Report> {
  const supabase = createClient();

  // 1. Verificar créditos
  const { data: credits } = await supabase
    .from('researcher_credits')
    .select('biochain_balance')
    .eq('researcher_id', researcherId)
    .single();

  if (!credits || credits.biochain_balance < 1) {
    throw new Error('Créditos insuficientes. Necesitas al menos 1 BIOCHAIN.');
  }

  // 2. Buscar blood_tests que cumplan criterios básicos
  const { data: bloodTests, error: bloodTestsError } = await supabase
    .from('blood_tests')
    .select('*')
    .eq('processed', true)
    .limit(50);

  if (bloodTestsError) {
    console.error('Error fetching blood tests:', bloodTestsError);
    throw bloodTestsError;
  }

  if (!bloodTests || bloodTests.length === 0) {
    throw new Error('No hay suficientes datos para generar el reporte');
  }

  // Get medical history for each blood test
  const userIds = [...new Set(bloodTests.map(bt => bt.user_id))];
  const { data: medicalHistories } = await supabase
    .from('medical_history')
    .select('*')
    .in('user_id', userIds);

  // Attach medical history to blood tests
  const bloodTestsWithHistory = bloodTests.map(bt => ({
    ...bt,
    medical_history: medicalHistories?.find(mh => mh.user_id === bt.user_id) || null
  }));

  // 3. Generar estadísticas agregadas
  const demographics = analyzeDemographics(bloodTestsWithHistory);
  const hormonalData = analyzeHormones(bloodTestsWithHistory);
  const medicalContext = anonymizeMedicalHistory(bloodTestsWithHistory);

  const reportData = {
    query,
    generated_at: new Date().toISOString(),
    total_samples: bloodTestsWithHistory.length,
    demographics,
    hormonal_data: hormonalData,
    medical_context: medicalContext,
  };

  // 4. Guardar reporte
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .insert({
      researcher_id: researcherId,
      query,
      report_data: reportData as any,
      blood_tests_used: bloodTestsWithHistory.map(bt => bt.id),
      cost_in_biochain: 1,
    })
    .select()
    .single();

  if (reportError) {
    console.error('Error creating report:', reportError);
    throw reportError;
  }

  // 5. Distribuir ganancias via BLOCKCHAIN (ATOMIC TRANSACTION)
  console.log('💰 Distributing earnings via Stellar blockchain...');

  const amountPerUser = 30 / bloodTestsWithHistory.length;

  // Get wallet addresses for all contributors
  const contributorUserIds = bloodTestsWithHistory.map(bt => bt.user_id);
  const { data: contributors, error: contributorsError } = await supabase
    .from('users')
    .select('id, wallet_address')
    .in('id', contributorUserIds);

  if (contributorsError || !contributors) {
    console.error('Error fetching contributors:', contributorsError);
    throw new Error('Failed to fetch contributor wallet addresses');
  }

  // Get platform wallet private key (should be from env in production)
  const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_WALLET_SECRET || '';

  if (!PLATFORM_PRIVATE_KEY) {
    console.error('⚠️  Platform private key not found, using mock distribution');
    // Fallback to mock if no platform key configured
    const earnings = bloodTestsWithHistory.map(bt => ({
      user_id: bt.user_id,
      report_id: report.id,
      amount_usdc: amountPerUser,
      transaction_hash: `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }));

    const { error: earningsError } = await supabase
      .from('user_earnings')
      .insert(earnings);

    if (earningsError) {
      console.error('Error creating earnings:', earningsError);
    }
  } else {
    // REAL BLOCKCHAIN TRANSACTION - Atomic distribution
    try {
      // Get researcher wallet address
      const { data: researcher } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', researcherId)
        .single();

      if (!researcher?.wallet_address) {
        throw new Error('Researcher wallet address not found');
      }

      // Prepare contributors array for atomic transaction
      // Filter only contributors with valid wallet addresses
      const contributorsForBlockchain = contributors
        .filter(c => {
          // More strict validation: must be a string, non-empty, and at least 56 chars (typical Stellar address)
          return (
            c.wallet_address &&
            typeof c.wallet_address === 'string' &&
            c.wallet_address.trim().length >= 56 &&
            c.wallet_address.startsWith('G')
          );
        })
        .map(c => ({
          walletAddress: c.wallet_address,
          usdcAmount: amountPerUser,
        }));

      console.log(`✅ Valid contributors with wallets: ${contributorsForBlockchain.length} / ${contributors.length}`);

      // Debug: Log each wallet address
      contributorsForBlockchain.forEach((c, i) => {
        console.log(`   Contributor ${i + 1}: ${c.walletAddress.substring(0, 10)}... (length: ${c.walletAddress.length})`);
      });

      if (contributorsForBlockchain.length === 0) {
        console.error('⚠️  No contributors have valid wallet addresses. Using mock distribution.');
        // Fallback to mock if no valid wallets
        const earnings = bloodTestsWithHistory.map(bt => ({
          user_id: bt.user_id,
          report_id: report.id,
          amount_usdc: amountPerUser,
          transaction_hash: `MOCK_NO_WALLET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }));

        await supabase.from('user_earnings').insert(earnings);

        // Continue without throwing error (report is still generated)
        console.log('⚠️  Report generated but payments mocked (no valid contributor wallets)');
        return report as Report;
      }

      // Execute atomic transaction on Stellar blockchain
      try {
        const { transactionHash, totalUSDCDistributed } = await consumeBIOCHAINAndDistributeUSDC(
          PLATFORM_PRIVATE_KEY,
          researcher.wallet_address,
          contributorsForBlockchain,
          1 // Consume 1 BIOCHAIN
        );

        console.log(`✅ Blockchain transaction successful! Hash: ${transactionHash}`);
        console.log(`✅ Total distributed: $${totalUSDCDistributed} USDC`);

        // Record earnings in database with REAL transaction hash
        const earnings = bloodTestsWithHistory.map(bt => ({
          user_id: bt.user_id,
          report_id: report.id,
          amount_usdc: amountPerUser,
          transaction_hash: transactionHash, // REAL blockchain transaction hash
        }));

        const { error: earningsError } = await supabase
          .from('user_earnings')
          .insert(earnings);

        if (earningsError) {
          console.error('Error recording earnings:', earningsError);
          throw earningsError;
        }
      } catch (stellarError: any) {
        // If blockchain transaction fails (e.g., contributors don't have USDC trustlines),
        // use mock transactions but still generate the report
        console.warn('⚠️  Blockchain transaction failed, using mock distribution:', stellarError.message);

        const mockEarnings = bloodTestsWithHistory.map(bt => ({
          user_id: bt.user_id,
          report_id: report.id,
          amount_usdc: amountPerUser,
          transaction_hash: `MOCK_TRUSTLINE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }));

        await supabase.from('user_earnings').insert(mockEarnings);

        console.log('⚠️  Report generated with mock payments (contributors need USDC trustlines)');
      }
    } catch (blockchainError: any) {
      console.error('❌ Blockchain setup failed:', blockchainError);
      // Even if blockchain setup fails, generate report with mock payments
      const mockEarnings = bloodTestsWithHistory.map(bt => ({
        user_id: bt.user_id,
        report_id: report.id,
        amount_usdc: amountPerUser,
        transaction_hash: `MOCK_ERROR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }));

      await supabase.from('user_earnings').insert(mockEarnings);
      console.log('⚠️  Report generated with mock payments (blockchain error)');
    }
  }

  // 6. Descontar BIOCHAIN
  const { error: updateError } = await supabase
    .from('researcher_credits')
    .update({
      biochain_balance: credits.biochain_balance - 1,
      updated_at: new Date().toISOString(),
    })
    .eq('researcher_id', researcherId);

  if (updateError) {
    console.error('Error updating credits:', updateError);
  }

  return report as Report;
}

function analyzeDemographics(bloodTests: any[]) {
  const ages = bloodTests
    .map(bt => bt.medical_history?.age)
    .filter(age => age != null);

  const contraceptiveUsers = bloodTests.filter(
    bt => bt.medical_history?.uses_contraceptives
  ).length;

  if (ages.length === 0) {
    return {
      age_range: 'N/A',
      average_age: 'N/A',
      contraceptive_users: 0,
      non_contraceptive_users: 0,
    };
  }

  return {
    age_range: `${Math.min(...ages)}-${Math.max(...ages)}`,
    average_age: (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1),
    contraceptive_users: contraceptiveUsers,
    non_contraceptive_users: bloodTests.length - contraceptiveUsers,
  };
}

function analyzeHormones(bloodTests: any[]) {
  const allHormones = bloodTests
    .map(bt => bt.extracted_data?.hormones)
    .filter(Boolean);

  if (allHormones.length === 0) {
    return {
      progesterone_avg: 'N/A',
      estrogen_avg: 'N/A',
      testosterone_avg: 'N/A',
    };
  }

  return {
    progesterone_avg: calculateAverage(allHormones, 'progesterone'),
    estrogen_avg: calculateAverage(allHormones, 'estrogen'),
    testosterone_avg: calculateAverage(allHormones, 'testosterone'),
  };
}

function anonymizeMedicalHistory(bloodTests: any[]) {
  return bloodTests.slice(0, 10).map(bt => ({
    age: bt.medical_history?.age || 0,
    contraceptive: bt.medical_history?.uses_contraceptives
      ? bt.medical_history?.contraceptive_type || 'Desconocido'
      : 'Ninguno',
    duration: bt.medical_history?.contraceptive_duration || 'N/A',
    conditions: bt.medical_history?.hormonal_conditions || [],
  }));
}

function calculateAverage(hormones: any[], key: string): string {
  const values = hormones
    .map(h => {
      const val = h[key];
      if (typeof val === 'string') {
        return parseFloat(val);
      }
      return val;
    })
    .filter(v => !isNaN(v) && v != null);

  if (values.length === 0) return 'N/A';

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return `${avg.toFixed(2)} ng/mL`;
}
