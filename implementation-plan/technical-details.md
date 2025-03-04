# OnePort Technical Details

## Backend (Nest.js)

### API Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login, return JWT
- `GET /auth/me` - Get the current authenticated user

#### Users
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update user profile
- `DELETE /users/profile` - Delete user account

#### Wallets
- `GET /wallets` - List all wallets for the authenticated user
- `POST /wallets` - Add a new wallet
- `GET /wallets/:id` - Get a specific wallet
- `PATCH /wallets/:id` - Update a wallet
- `DELETE /wallets/:id` - Delete a wallet
- `GET /wallets/:id/balance` - Get wallet balance

### Database Models

#### User Entity
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Wallet, wallet => wallet.user)
  wallets: Wallet[];
}
```

#### Wallet Entity
```typescript
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

### Solana Integration

#### Balance Fetching
```typescript
async function getSolanaBalance(walletAddress: string): Promise<number> {
  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const publicKey = new PublicKey(walletAddress);
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}
```

#### SPL Token Fetching
```typescript
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

## Frontend (Next.js)

### Authentication State
```typescript
// Using React Context or Zustand
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
}
```

### Wallet Management
```typescript
interface WalletState {
  wallets: Wallet[];
  isLoading: boolean;
  addWallet: (name: string, address: string, network: string) => Promise<void>;
  removeWallet: (id: string) => Promise<void>;
  fetchWallets: () => Promise<void>;
}
```

### API Integration
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  async post<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Additional methods for PUT, PATCH, DELETE
};
```

## Docker Setup

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: oneport-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-oneport}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - oneport-network

networks:
  oneport-network:
    driver: bridge

volumes:
  postgres-data:
```

## Styling With Tailwind CSS & Shadcn

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```