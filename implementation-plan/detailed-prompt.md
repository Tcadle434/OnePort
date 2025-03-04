# Detailed Implementation Prompt for OnePort

## Overview

Build OnePort, a cryptocurrency portfolio tracker, starting with Solana wallet balance tracking. This is the first phase of a larger application that will eventually track multiple financial assets. The application will allow users to track wallet balances without connecting their actual wallets, making it more secure for users who are cautious about connecting wallets to new sites.

## Technology Stack

### Frontend:
- Next.js with App Router
- React 
- TypeScript (strict mode)
- Tailwind CSS for styling
- shadcn/ui for UI components
- Zustand or React Context for state management

### Backend:
- Nest.js (Node.js framework)
- TypeScript
- PostgreSQL with TypeORM for database management
- JWT for authentication
- @solana/web3.js and @solana/spl-token for Solana integration
- CoinGecko API for price data

### Development:
- Turbo monorepo
- Docker for local PostgreSQL
- AWS for future deployment
- ESLint and Prettier for code quality

## Implementation Plan

Before starting to code, please follow this plan:

1. **Project Setup** 
   - Set up the monorepo structure with Next.js frontend and Nest.js backend
   - Configure TypeScript, ESLint, and Prettier
   - Set up Docker for PostgreSQL
   - Configure environment variables

2. **Database Schema**
   - Create Users table: id, email, password_hash, created_at, updated_at
   - Create Wallets table: id, user_id, name, address, network, created_at, updated_at
   - Optionally create a balance cache table for performance

3. **Authentication**
   - Implement user registration and validation
   - Set up JWT-based authentication
   - Create login and logout functionality
   - Secure API routes

4. **Wallet Management**
   - Implement wallet addition and validation
   - Create wallet listing functionality
   - Add wallet editing and deletion

5. **Balance Tracking**
   - Integrate Solana Web3.js library
   - Fetch SOL balance from wallets
   - Fetch SPL token balances
   - Integrate CoinGecko API for price data
   - Map token addresses to names and symbols using Solana token list

6. **Frontend Implementation**
   - Create authentication pages (login/register)
   - Implement dashboard with wallet overview
   - Add wallet management interface
   - Create balance display with token details
   - Implement responsive design

7. **Error Handling**
   - Handle invalid wallet addresses
   - Manage API rate limits
   - Gracefully handle missing data
   - Implement proper error messages

8. **Testing**
   - Test authentication flow
   - Verify wallet management functionality
   - Test balance fetching with sample data
   - Ensure responsive design works on different devices

## Implementation Instructions

1. Begin by setting up the project structure according to the plan
2. Implement features in the recommended order
3. Use best practices for code organization and modularity
4. Implement proper error handling throughout the application
5. Follow TypeScript strict mode principles
6. Ensure security best practices, especially for user authentication
7. Optimize performance with appropriate caching
8. Make the UI intuitive and responsive

## Expected Deliverables

1. A working Turbo monorepo with Next.js frontend and Nest.js backend
2. User authentication system with registration and login
3. Wallet management functionality (add, list, edit, delete)
4. Solana balance tracking for SOL and SPL tokens
5. Dashboard displaying wallet balances and token details
6. Docker configuration for local development
7. Comprehensive documentation

## Important Design Considerations

- The application should be designed with scalability in mind, as more asset types will be added later
- Security is paramount, especially for handling user data
- The UI should be clean, intuitive, and mobile-responsive
- Error handling should be user-friendly
- Performance optimization is important, especially for balance fetching

## Technical Appendix

### Database Models

```typescript
// User Entity
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Wallet, wallet => wallet.user)
  wallets: Wallet[];
}

// Wallet Entity
@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  network: string; // SOLANA, ETHEREUM, etc.

  @ManyToOne(() => User, user => user.wallets)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Solana Integration Example

```typescript
async function getSolanaBalance(walletAddress: string): Promise<number> {
  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const publicKey = new PublicKey(walletAddress);
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}

async function getSplTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const publicKey = new PublicKey(walletAddress);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    { programId: TOKEN_PROGRAM_ID }
  );

  return tokenAccounts.value.map(account => {
    const accountData = account.account.data.parsed.info;
    const mint = accountData.mint;
    const amount = accountData.tokenAmount.uiAmount;
    return { mint, amount };
  });
}
```

### Frontend Authentication State

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
}
```

Now, please first outline the complete plan before starting to implement the code. Once the plan is approved, proceed with the implementation following the provided guidelines.