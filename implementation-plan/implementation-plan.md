# OnePort Implementation Plan

## Phase 1: Project Setup & Configuration

### 1.1 Initialize Backend (NestJS)
- Create the `apps/api` directory and initialize NestJS
- Configure Typescript, ESLint and formatting
- Set up Docker for PostgreSQL with docker-compose
- Configure environment variables

### 1.2 Frontend Setup
- Update the existing Next.js app in `apps/web` 
- Add and configure Tailwind CSS
- Set up shadcn/ui components
- Configure environment variables

### 1.3 Database Setup
- Create PostgreSQL Docker container
- Set up TypeORM in the NestJS application
- Create database migration for users and wallets tables

## Phase 2: Authentication Implementation

### 2.1 Backend Authentication
- Create User entity and repository
- Implement user registration endpoint with password hashing
- Implement JWT-based authentication
- Create login endpoint with token generation
- Implement password reset (optional for MVP)

### 2.2 Frontend Authentication
- Create authentication state management
- Implement sign-up form with validation
- Implement sign-in form with validation
- Create protected routes using middleware
- Add error handling and user feedback

## Phase 3: Wallet Management

### 3.1 Backend Wallet Management
- Create Wallet entity and repository
- Implement endpoints to add, list, and delete wallets
- Create validation for Solana addresses
- Add user-wallet relationship

### 3.2 Frontend Wallet Management
- Implement "Add Wallet" form with validation
- Create wallet list component
- Implement wallet detail view
- Add error handling for invalid addresses

## Phase 4: Balance Tracking

### 4.1 Backend Balance Implementation
- Integrate Solana-Web3.js library
- Implement SOL balance fetching
- Implement SPL token balance fetching
- Create balance caching mechanism (optional)

### 4.2 Price Data Integration
- Integrate CoinGecko API for token prices
- Implement price fetching for SOL and SPL tokens
- Create price caching mechanism

### 4.3 Token Metadata Integration
- Integrate Solana token list for metadata
- Map token addresses to names and symbols
- Handle unknown tokens gracefully

## Phase 5: Frontend Display and Dashboard

### 5.1 Dashboard Implementation
- Create main dashboard layout
- Implement wallet overview component
- Create charts for portfolio allocation

### 5.2 Balance Display
- Create balance list component with token details
- Implement USD value conversion
- Add sorting and filtering options
- Implement responsive design for mobile

## Phase 6: Testing and Optimization

### 6.1 Backend Testing
- Write unit tests for critical components
- Implement integration tests for API endpoints
- Add error handling and logging

### 6.2 Frontend Testing
- Test authentication flow
- Test wallet management functionality
- Test balance display with sample data

### 6.3 Performance Optimization
- Implement caching strategies
- Optimize database queries
- Add API rate limiting for CoinGecko

## Phase 7: Deployment (Future)

### 7.1 Backend Deployment
- Set up AWS deployment pipeline
- Configure production database
- Set up proper environment variables

### 7.2 Frontend Deployment
- Set up Vercel deployment
- Configure production environment
- Set up monitoring and analytics