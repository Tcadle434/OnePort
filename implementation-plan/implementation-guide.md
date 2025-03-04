# OnePort Implementation Guide

This guide provides step-by-step instructions for implementing the OnePort cryptocurrency portfolio tracker.

## Prerequisites

- Node.js (v18 or higher)
- npm (v10 or higher)
- Docker and Docker Compose
- Basic understanding of TypeScript, React, and NestJS
- Knowledge of Solana blockchain (for integration)

## Getting Started

### 1. Initialize the Backend (Nest.js)

```bash
# Create the API directory
mkdir -p apps/api

# Initialize a new Nest.js application
cd apps/api
npm init -y
npm install @nestjs/cli -D
npx nest new . --package-manager npm

# Install dependencies
npm install @nestjs/typeorm typeorm pg @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @solana/web3.js @solana/spl-token class-validator class-transformer
npm install -D @types/passport-jwt @types/bcrypt
```

### 2. Configure Docker for PostgreSQL

Create a `docker-compose.yml` file in the `apps/api` directory:

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

Create a `.env` file in the `apps/api` directory:

```
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=oneport

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=1d

# Application
PORT=3001
NODE_ENV=development
```

### 3. Update Next.js Frontend

```bash
# Navigate to the web directory
cd apps/web

# Install dependencies for Next.js with Tailwind CSS and shadcn
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge tailwindcss-animate lucide-react next-auth zustand

# Install development dependencies
npm install -D tailwindcss postcss autoprefixer
```

Create a Tailwind CSS configuration:

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js` with the shadcn configuration.

Update `app/globals.css` to include Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* Other CSS variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* Other dark theme variables */
  }
}
```

### 4. Implement Backend Modules

#### 4.1 Main App Module

Create or update `apps/api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { BalancesModule } from './balances/balances.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    UsersModule,
    WalletsModule,
    BalancesModule,
  ],
})
export class AppModule {}
```

#### 4.2 User Entity

Create `apps/api/src/users/entities/user.entity.ts`:

```typescript
import { 
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, 
  UpdateDateColumn, OneToMany 
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

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

#### 4.3 Authentication Module

Create necessary authentication files and implement JWT-based authentication.

### 5. Frontend Implementation

#### 5.1 Authentication Components

Create sign-up and sign-in forms with validation.

#### 5.2 Wallet Management

Implement wallet management components and integration with the API.

#### 5.3 Balance Display

Create components for displaying wallet balances and token details.

## Running the Application

### Backend

```bash
# Start PostgreSQL with Docker
cd apps/api
docker-compose up -d

# Start the NestJS application
npm run start:dev
```

### Frontend

```bash
# Start the Next.js application
cd apps/web
npm run dev
```

## Testing

### Backend Tests

Create and run tests for critical components:

```bash
cd apps/api
npm run test
```

### Frontend Tests

Test the frontend components and integration:

```bash
cd apps/web
npm run test
```