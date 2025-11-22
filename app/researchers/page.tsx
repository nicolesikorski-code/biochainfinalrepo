import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingResearcher() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary">BioChain</h1>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Real and Verified <br />
              <span className="text-primary">Hormonal Data</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Access hormonal data from real women, fully anonymized
              and verified on blockchain, for your medical research.
            </p>
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Start Now
              </Button>
            </Link>
          </div>
          <div className="text-9xl text-center">
            🔬
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Why BioChain?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Verified Data</h4>
              <p className="text-gray-600">
                Every hormonal study is verified on Stellar blockchain.
                Integrity guaranteed with immutable cryptographic hashes.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h4 className="text-xl font-bold mb-2">AI Assistant</h4>
              <p className="text-gray-600">
                Define your research criteria by chatting with our AI
                specialized in hormonal studies.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h4 className="text-xl font-bold mb-2">100% Anonymous</h4>
              <p className="text-gray-600">
                All personal information is removed with CVM technology.
                You only receive aggregated hormonal data.
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
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Register Your Account</h4>
              <p className="text-gray-600">
                Create your account with Google and choose the Researcher role.
                Your Stellar wallet is generated automatically.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Buy BIOCHAIN Credits</h4>
              <p className="text-gray-600">
                Purchase credits to generate reports. 1 BIOCHAIN = 1 complete report.
                Packages starting at $50 USD.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Define Your Criteria with AI</h4>
              <p className="text-gray-600">
                Use our AI chat to specify exactly what data you need:
                age range, contraceptive use, hormonal conditions, etc.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Receive Your Report</h4>
              <p className="text-gray-600">
                Get aggregated data on progesterone, estrogen, testosterone, FSH, LH,
                along with fully anonymized demographic and medical context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Types */}
      <section className="bg-violet-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-4">
            Available Data Types
          </h3>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Access complete hormonal information along with relevant medical context
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-6">
              <h4 className="text-lg font-bold mb-4 text-primary">Hormonal Data</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Progesterone</li>
                <li>• Estrogen (Estradiol)</li>
                <li>• Testosterone</li>
                <li>• FSH (Follicle-Stimulating Hormone)</li>
                <li>• LH (Luteinizing Hormone)</li>
                <li>• Averages and standard deviations</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-bold mb-4 text-primary">Medical Context</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Age range and demographics</li>
                <li>• Hormonal contraceptive use</li>
                <li>• Hormonal conditions (PCOS, endometriosis, etc.)</li>
                <li>• Menstrual cycle regularity</li>
                <li>• Pregnancy history</li>
                <li>• Lifestyle (physical activity, habits)</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">
          Transparent Pricing
        </h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <h4 className="text-xl font-bold mb-4">Basic</h4>
              <div className="text-4xl font-bold text-primary mb-2">$50</div>
              <p className="text-sm text-gray-600 mb-6">5 BIOCHAIN Credits</p>
              <ul className="space-y-2 text-sm text-left mb-6">
                <li>✓ 5 complete reports</li>
                <li>✓ AI chat</li>
                <li>✓ Blockchain-verified data</li>
                <li>✓ Email support</li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 border-2 border-accent shadow-xl">
            <div className="text-center">
              <div className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">
                POPULAR
              </div>
              <h4 className="text-xl font-bold mb-4">Standard</h4>
              <div className="text-4xl font-bold text-accent mb-2">$135</div>
              <p className="text-sm text-gray-600 mb-6">15 BIOCHAIN Credits</p>
              <ul className="space-y-2 text-sm text-left mb-6">
                <li>✓ 15 complete reports</li>
                <li>✓ Unlimited AI chat</li>
                <li>✓ Blockchain-verified data</li>
                <li>✓ Priority support</li>
                <li>✓ <strong>10% savings</strong></li>
              </ul>
            </div>
          </Card>

          <Card className="p-8">
            <div className="text-center">
              <h4 className="text-xl font-bold mb-4">Premium</h4>
              <div className="text-4xl font-bold text-primary mb-2">$400</div>
              <p className="text-sm text-gray-600 mb-6">50 BIOCHAIN Credits</p>
              <ul className="space-y-2 text-sm text-left mb-6">
                <li>✓ 50 complete reports</li>
                <li>✓ Unlimited AI chat</li>
                <li>✓ Blockchain-verified data</li>
                <li>✓ VIP 24/7 support</li>
                <li>✓ <strong>20% savings</strong></li>
              </ul>
            </div>
          </Card>
        </div>
        <p className="text-center text-sm text-gray-600 mt-8">
          For each report generated, contributors receive $30 USDC
        </p>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-6">
            Start Your Research Today
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join researchers who are already using BioChain to
            access real and verified hormonal data
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Create Free Account
            </Button>
          </Link>
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
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
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
                <li><a href="#" className="hover:text-white">Security</a></li>
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
