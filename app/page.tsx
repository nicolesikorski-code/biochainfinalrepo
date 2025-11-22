import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b border-violet-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">
            BioChain
          </h1>
          <Link href="/login">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold mb-6 leading-tight">
            Your Hormonal Data
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">
              Secure & Profitable
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Own your health data. Earn USDC when researchers use your anonymized hormonal studies.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link href="/researchers">
              <Button size="lg" className="text-lg px-12 py-7 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-xl">
                I Want to Access Data
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" className="text-lg px-12 py-7 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-xl">
                I Want to Share My Data
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Simple & Secure
          </h3>
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-violet-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl">🔐</span>
              </div>
              <h4 className="text-2xl font-bold mb-3 text-gray-900">100% Private</h4>
              <p className="text-gray-600 text-lg">
                Your data is automatically anonymized. Your identity is protected by blockchain.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl">💰</span>
              </div>
              <h4 className="text-2xl font-bold mb-3 text-gray-900">Earn USDC</h4>
              <p className="text-gray-600 text-lg">
                Receive direct compensation every time a researcher uses your data.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-orange-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl">⚡</span>
              </div>
              <h4 className="text-2xl font-bold mb-3 text-gray-900">Easy to Use</h4>
              <p className="text-gray-600 text-lg">
                Just upload your PDF studies. We handle the rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-violet-600 to-orange-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-5xl font-bold mb-6">
            Get Started Today
          </h3>
          <p className="text-2xl mb-10 opacity-90">
            Join the secure medical data revolution
          </p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-12 py-6 bg-white text-violet-600 hover:bg-gray-100 shadow-xl">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h4 className="text-3xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-orange-400 bg-clip-text text-transparent">
            BioChain
          </h4>
          <p className="text-gray-400 mb-8 text-lg">
            Secure hormonal data on blockchain
          </p>
          <div className="flex gap-8 justify-center text-gray-400">
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
