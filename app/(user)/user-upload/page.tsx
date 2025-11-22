'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/shared/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';
import { processPDF, validatePDFFile } from '@/lib/process-pdf';
import { storeHashOnBlockchain, storeZKProofsOnBlockchain } from '@/lib/stellar';
import { generateDataProofs, serializeProofs } from '@/lib/zk-proofs';
import type { User, MedicalHistory } from '@/types';

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
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

    const { data: historyData } = await supabase
      .from('medical_history')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    setMedicalHistory(historyData as MedicalHistory | null);
    setLoading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validation = validatePDFFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file || !user || !medicalHistory?.consent_signed) {
      return;
    }

    setUploading(true);
    setError('');
    setProgress('Starting process...');

    try {
      const supabase = createClient();

      // Step 1: Process PDF with Nvidia CVM (mock)
      setProgress('Processing PDF with Nvidia CVM...');
      const { fileHash, extractedData } = await processPDF(file);

      // Step 1.5: Generate Zero-Knowledge Proofs
      setProgress('Generating Zero-Knowledge Proofs...');
      console.log('🔐 Generating ZK-proofs for data...');

      const zkProofs = generateDataProofs({
        age: medicalHistory?.age,
        estrogen: extractedData.hormones?.estrogen,
        progesterone: extractedData.hormones?.progesterone,
        testosterone: extractedData.hormones?.testosterone,
        uses_contraceptives: medicalHistory?.uses_contraceptives,
        has_pcos: medicalHistory?.hormonal_conditions?.includes('SOP'),
      });

      console.log(`✅ Generated ${zkProofs.length} ZK-proofs:`, zkProofs.map(p => p.criteria));

      // Get private key from session (localStorage)
      const session = getAuthSession();
      if (!session?.privateKey) {
        throw new Error('Private key not found. Please log in again.');
      }

      // Step 2: Store hash on Stellar blockchain (REAL)
      setProgress('Storing hash on Stellar blockchain...');

      const { transactionId, blockchainHash } = await storeHashOnBlockchain(
        session.privateKey,
        fileHash
      );

      // Step 2.5: Store ZK-proofs on blockchain (REAL)
      setProgress('Storing Zero-Knowledge Proofs on blockchain...');

      const serializedProofs = serializeProofs(zkProofs);
      const { transactionId: zkTxId } = await storeZKProofsOnBlockchain(
        session.privateKey,
        serializedProofs
      );

      console.log('✅ ZK-proofs stored on blockchain! TX:', zkTxId);

      // Step 3: Upload PDF to Supabase Storage (mock - only save reference)
      setProgress('Securely storing file...');
      const mockFileUrl = `storage/${user.id}/${fileHash}.pdf`;

      // Step 4: Save record to database
      setProgress('Registering in database...');

      // Store ZK-proof transaction ID in extracted_data for reference
      const dataWithZkProofs = {
        ...extractedData,
        zk_proofs_tx_id: zkTxId,
        zk_proofs_count: zkProofs.length,
      };

      const { error: dbError } = await supabase
        .from('blood_tests')
        .insert({
          user_id: user.id,
          file_url: mockFileUrl,
          file_hash: fileHash,
          blockchain_hash: blockchainHash,
          stellar_transaction_id: transactionId,
          lab_name: extractedData.lab_name,
          test_date: extractedData.test_date,
          extracted_data: dataWithZkProofs,
          processed: true,
        });

      if (dbError) throw dbError;

      setProgress('Successfully completed!');
      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/user-dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error uploading:', err);
      setError(err.message || 'Error uploading file. Please try again.');
      setProgress('');
    } finally {
      setUploading(false);
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

  const canUpload = medicalHistory?.consent_signed;

  return (
    <MainLayout userRole="data_contributor" userName={user.email}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Hormonal Study
          </h1>
          <p className="text-gray-600">
            Upload your blood tests in PDF format to start earning USDC
          </p>
        </div>

        {!canUpload && (
          <Alert className="mb-8 bg-orange-50 border-orange-200">
            <AlertDescription className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold mb-1">Action Required</h3>
                <p className="text-sm mb-3">
                  You must complete your medical history and sign the consent form before uploading studies.
                </p>
                <Button
                  size="sm"
                  onClick={() => router.push('/user-medical-history')}
                >
                  Complete Medical History
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">
              ✓ Study uploaded successfully. Hash stored on Stellar blockchain. Redirecting...
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-8 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center ${
              dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
            } ${!canUpload ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              if (canUpload && !uploading) {
                document.getElementById('file-input')?.click();
              }
            }}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              disabled={!canUpload || uploading}
            />

            <div className="mb-4">
              <span className="text-6xl">📄</span>
            </div>

            {file ? (
              <div>
                <p className="text-lg font-semibold mb-2">Selected File:</p>
                <p className="text-gray-600 mb-1">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold mb-2">
                  Drag your PDF here
                </p>
                <p className="text-gray-600 mb-4">
                  or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Maximum 10 MB • PDF files only
                </p>
              </div>
            )}
          </div>

          {uploading && progress && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <p className="text-sm font-medium">{progress}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          )}
        </Card>

        {file && !uploading && !success && (
          <div className="flex gap-4">
            <Button
              onClick={handleUpload}
              disabled={!canUpload || uploading}
              size="lg"
              className="flex-1"
            >
              Upload Study
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setFile(null);
                setError('');
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        )}

        <Card className="p-6 bg-violet-50 mt-8">
          <h3 className="text-lg font-semibold mb-4">What happens to my file?</h3>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">1.</span>
              <span>
                <strong>Secure Processing:</strong> Your PDF is processed with Nvidia CVM technology to extract
                only hormonal data, removing all personally identifiable information
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">2.</span>
              <span>
                <strong>Zero-Knowledge Proofs:</strong> Cryptographic proofs are generated that demonstrate
                your data meets certain criteria (age, hormonal levels) WITHOUT revealing the exact values
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">3.</span>
              <span>
                <strong>Immutable Blockchain:</strong> The ZK-proofs and a SHA-256 hash are stored
                on the Stellar blockchain (testnet), creating an immutable cryptographic proof
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">4.</span>
              <span>
                <strong>Total Anonymization:</strong> Only aggregated and anonymized hormonal data
                is shared with researchers. Your identity remains completely protected
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">5.</span>
              <span>
                <strong>Automatic Compensation:</strong> Each time a researcher uses your data,
                you automatically receive USDC compensation in your Stellar wallet
              </span>
            </li>
          </ol>
        </Card>

        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">PDF Requirements</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>Readable PDF format (no blurry scans)</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>Hormone results (Progesterone, Estrogen, Testosterone, FSH, LH)</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>Study date clearly visible</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>Maximum size: 10 MB</span>
            </li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}
