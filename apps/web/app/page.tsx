export default function Home() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-primary">Crypto Portfolio</span> Tracking
        </h1>
        <p className="text-xl max-w-2xl mb-10 text-muted-foreground">
          Track your Solana wallet balances securely without connecting your wallet.
          OnePort provides a secure, powerful way to monitor your crypto assets.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="/auth/register" 
            className="px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Get Started
          </a>
          <a 
            href="/auth/login" 
            className="px-8 py-3 border border-border rounded-md hover:bg-secondary transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
      
      <div className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-3 text-primary">Track Without Connecting</h3>
            <p className="text-muted-foreground">
              Simply enter wallet addresses to monitor without exposing private keys.
              Keep your assets secure while maintaining full visibility.
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-3 text-primary">Solana Support</h3>
            <p className="text-muted-foreground">
              Track SOL and SPL tokens with USD conversion rates.
              Get real-time prices and total portfolio valuation.
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-3 text-primary">Unlimited Wallets</h3>
            <p className="text-muted-foreground">
              Add multiple wallets to track all your assets in one place.
              Organize and monitor your entire crypto portfolio effortlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
