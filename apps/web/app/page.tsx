export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        OnePort
      </h1>
      <p className="text-xl max-w-2xl mb-8">
        Track your Solana wallet balances securely without connecting your wallet.
      </p>
      <div className="flex flex-col md:flex-row gap-4">
        <a 
          href="/auth/register" 
          className="px-8 py-3 bg-black text-white rounded-md hover:bg-black/80"
        >
          Get Started
        </a>
        <a 
          href="/auth/login" 
          className="px-8 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Sign In
        </a>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Track Without Connecting</h3>
          <p>
            Simply enter wallet addresses to monitor without exposing private keys.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Solana Support</h3>
          <p>
            Track SOL and SPL tokens with USD conversion rates.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Unlimited Wallets</h3>
          <p>
            Add multiple wallets to track all your assets in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
