import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingUser() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary">BioChain</h1>
          </Link>
          <Link href="/login">
            <Button className="bg-accent hover:bg-accent/90">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Your Data, <br />
              <span className="text-accent">Your Control</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Monetize your hormonal studies securely and privately.
              Receive USDC compensation each time your anonymized data is used.
            </p>
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 bg-accent hover:bg-accent/90">
                Start Earning
              </Button>
            </Link>
          </div>
          <div className="text-9xl text-center">
            💰
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-orange-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Why BioChain?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">💸</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Earn Real Money</h4>
              <p className="text-gray-600">
                Receive USDC compensation each time a researcher
                uses your data. $30 USD distributed for each report generated.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h4 className="text-xl font-bold mb-2">100% Private</h4>
              <p className="text-gray-600">
                Your personal data is completely removed. Only anonymized
                hormonal data verified on blockchain is shared.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🌟</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Total Control</h4>
              <p className="text-gray-600">
                You decide what data to share. You can revoke your consent
                at any time and delete your data.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h3>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Sign Up with Google</h4>
              <p className="text-gray-600">
                Create your account in seconds with Google. Your Stellar wallet is generated
                automatically to receive USDC payments.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Complete Your Medical History</h4>
              <p className="text-gray-600">
                Provide information about your age, contraceptive use, hormonal
                conditions and lifestyle. Your data is protected and encrypted.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Upload Your Hormonal Studies</h4>
              <p className="text-gray-600">
                Upload your blood tests in PDF format. We process the file with CVM
                technology, generate a hash and store it on the Stellar blockchain.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Receive Automatic Compensation</h4>
              <p className="text-gray-600">
                Each time a researcher generates a report that includes your data,
                you receive USDC automatically in your wallet. No hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-violet-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-4">
            Your Security is Our Priority
          </h3>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We use cutting-edge technology to protect your privacy
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-6">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                Nvidia CVM Technology
              </h4>
              <p className="text-sm text-gray-700">
                We process your PDFs in Nvidia's confidential computing environment (CVM).
                Your personal information is automatically removed before any analysis.
                Only anonymized hormonal data is extracted.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">⛓️</span>
                Stellar Blockchain
              </h4>
              <p className="text-sm text-gray-700">
                Each file generates a SHA-256 cryptographic hash that's stored on the Stellar
                blockchain. This creates an immutable proof of data integrity that no one can
                alter, not even us.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                End-to-End Encryption
              </h4>
              <p className="text-sm text-gray-700">
                All your data is encrypted at rest and in transit. We use the
                highest industry security standards. Your medical history
                is only accessible to you.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Total Anonymization
              </h4>
              <p className="text-sm text-gray-700">
                Researchers NEVER receive your name, email, or any information
                that could identify you. They only see aggregated statistics from multiple
                participants.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Earnings */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">
          How Much Can I Earn?
        </h3>
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-orange-50 to-white mb-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">💰</div>
              <h4 className="text-2xl font-bold mb-2">Data Usage Compensation</h4>
              <p className="text-gray-600">
                For each report generated, $30 USDC is distributed equitably
                among all contributors whose data was included
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-bold text-accent mb-1">$0.60</p>
                <p className="text-sm text-gray-600">Per report (50 samples)</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-bold text-accent mb-1">$1.50</p>
                <p className="text-sm text-gray-600">Per report (20 samples)</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-bold text-accent mb-1">$6.00</p>
                <p className="text-sm text-gray-600">Per report (5 samples)</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-orange-200">
              <p className="text-sm text-gray-700 text-center">
                💡 <strong>Tip:</strong> The more specific your profile (unique hormonal
                conditions, specific contraceptive use), the more likely you'll appear
                in fewer reports and receive higher individual compensation.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-bold mb-4">Frequently Asked Questions</h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-1">When do I receive payment?</p>
                <p className="text-gray-600">
                  Immediately after a researcher generates a report that includes
                  your data. USDC is automatically deposited into your Stellar wallet.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Is there a limit to how much I can earn?</p>
                <p className="text-gray-600">
                  There's no limit. You can upload multiple studies over time and
                  earn each time they're used in research.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Can I withdraw my USDC?</p>
                <p className="text-gray-600">
                  Yes, in production you'll be able to transfer your USDC to any Stellar-compatible
                  wallet or exchange it for other cryptocurrencies.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Is my data secure?</p>
                <p className="text-gray-600">
                  Absolutely. We use the most advanced encryption and
                  anonymization technologies. Your identity is 100% protected.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-6">
            Start Monetizing Your Data Today
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join women who are already earning USDC by sharing their
            hormonal data securely and privately
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Sign Up Free
            </Button>
          </Link>
          <p className="text-sm mt-4 opacity-75">
            No hidden costs • No commissions • 100% free
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">BioChain</h4>
              <p className="text-sm text-gray-400">
                Secure and private hormonal data on blockchain
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Product</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">How it works</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Questions</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Company</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Consent</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 BioChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
