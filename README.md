# BioChain

**Decentralized Platform for Women's Hormonal Health Data**

BioChain is a blockchain-based platform that enables women to monetize their hormonal health data while maintaining complete privacy and anonymity. Built for researchers who need access to quality hormonal data and for women who want to earn compensation for contributing their medical information.

## 🌟 Key Features

### For Data Contributors (Women)
- **Earn USDC**: Receive automatic compensation each time your anonymized data is used in research
- **Complete Privacy**: All personal information is removed using NVIDIA CVM technology
- **Zero-Knowledge Proofs**: Cryptographic proofs that verify data validity without revealing actual values
- **Blockchain Verification**: SHA-256 hashes stored on Stellar blockchain for immutable proof
- **Full Control**: Revoke consent and delete data at any time

### For Researchers
- **Quality Data**: Access to verified, blockchain-secured hormonal data
- **AI-Powered Search**: Natural language queries to find specific participant profiles
- **Instant Results**: Generate comprehensive reports with aggregated, anonymized data
- **Fair Compensation**: Transparent payment system - $30 USDC distributed per report
- **BIOCHAIN Credits**: Platform token system for purchasing reports

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Beautiful, accessible UI components

### Backend & Database
- **Supabase** - PostgreSQL database for off-chain data
- **Next.js API Routes** - Serverless backend functions

### Blockchain & Web3
- **Stellar Blockchain** - Testnet for USDC payments and hash storage
- **Web3Auth** - OAuth-based wallet generation (Sapphire Devnet)
- **Custom Assets**: USDC (payments) & BIOCHAIN (platform credits)

### Privacy & Security
- **NVIDIA CVM** - Confidential Virtual Machine for secure PDF processing
- **Zero-Knowledge Proofs** - Pedersen Commitments for privacy-preserving verification
- **SHA-256 Hashing** - File integrity verification on blockchain

### AI & Processing
- **OpenAI GPT-4** - Natural language processing for research queries (mock in MVP)
- **PDF Processing** - Extract hormonal data while removing PII

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Web3Auth account (optional for OAuth)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/biochainrepofinal.git
cd biochainrepofinal
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**

Create a \`.env.local\` file:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Web3Auth (optional)
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id

# OpenAI (for production AI features)
OPENAI_API_KEY=your_openai_key
\`\`\`

4. **Set up Supabase database**

Run the SQL schema in Supabase SQL Editor:
\`\`\`bash
cat supabase-schema.sql
\`\`\`

5. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing Stellar Blockchain

Run the comprehensive Stellar blockchain tests:

\`\`\`bash
npx tsx scripts/test-stellar.ts
\`\`\`

This will test:
- Keypair generation
- Account funding (Friendbot)
- Hash storage on blockchain
- Hash verification
- USDC trustline creation
- Token transfers
- Atomic transactions

## 📊 Database Schema

### Main Tables
- **users** - User accounts (researchers & contributors)
- **medical_history** - Contributor medical information
- **blood_tests** - Uploaded hormonal studies with blockchain hashes
- **researcher_credits** - BIOCHAIN credit balances
- **reports** - Generated research reports
- **user_earnings** - USDC payment history

## 🔐 How It Works

### For Contributors

1. **Sign up** with Google OAuth (Web3Auth generates Stellar wallet automatically)
2. **Complete medical history** and sign informed consent
3. **Upload PDF** of hormonal blood test results
4. **Processing**:
   - PDF processed with NVIDIA CVM (removes PII)
   - SHA-256 hash generated and stored on Stellar blockchain
   - Zero-Knowledge Proofs generated for data validity
   - Anonymized data stored in database
5. **Earn USDC** automatically when researchers use your data

### For Researchers

1. **Sign up** and purchase BIOCHAIN credits
2. **Use AI Chat** to describe research criteria in natural language
3. **Generate report** - System finds matching participants
4. **Atomic transaction** on Stellar:
   - Researcher pays 1 BIOCHAIN token
   - $30 USDC distributed to all contributors in report
5. **Download results** - Aggregated, anonymized hormonal data

## 🌐 Smart Contracts (Stellar)

### Key Functions

**Hash Storage**
\`\`\`typescript
storeHashOnBlockchain(privateKey: string, hash: string)
\`\`\`

**ZK-Proof Storage**
\`\`\`typescript
storeZKProofsOnBlockchain(privateKey: string, proofsData: string)
\`\`\`

**USDC Trustline**
\`\`\`typescript
createUSDCTrustline(userPrivateKey: string)
\`\`\`

**Atomic Payment Distribution**
\`\`\`typescript
consumeBIOCHAINAndDistributeUSDC(
  platformPrivateKey: string,
  researcherPublicKey: string,
  contributors: Array<{walletAddress: string, usdcAmount: number}>
)
\`\`\`

## 📱 User Flows

### Contributor Dashboard
- View total USDC earnings
- See uploaded studies with blockchain verification
- Track data usage history
- Manage wallet and trustlines

### Researcher Dashboard
- Purchase BIOCHAIN credits
- View available credits balance
- Generate new reports via AI chat
- Access past reports and data

## 🔒 Privacy Features

1. **NVIDIA CVM**: Processes PDFs in secure enclave, removes all PII
2. **Zero-Knowledge Proofs**: Proves data meets criteria without revealing values
3. **Blockchain Hashing**: Immutable proof of data integrity
4. **Complete Anonymization**: Researchers never see personal information
5. **Consent Management**: Contributors can revoke access anytime

## 🎯 Roadmap

- [ ] Deploy to production (mainnet)
- [ ] Real NVIDIA CVM integration
- [ ] Advanced ZK-proof circuits
- [ ] Mobile app (React Native)
- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] DAO governance for platform decisions
- [ ] Expanded health data types

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built for Web3 hackathon
- Stellar Development Foundation for blockchain infrastructure
- Web3Auth for seamless wallet integration
- NVIDIA for CVM technology concept
- OpenAI for natural language processing

## 📞 Contact

For questions or support, please open an issue in this repository.

---

**Built with ❤️ for women's health research and data sovereignty**
