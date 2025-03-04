# OnePort Project Structure

## Monorepo Structure

```
/apps
  /web               # Next.js frontend application
  /api               # Nest.js backend API
  /docs              # Documentation site
/packages
  /ui                # Shared UI components
  /typescript-config # Shared TypeScript configuration
  /eslint-config     # Shared ESLint configuration
  /database          # Database models and migrations
  /solana            # Solana utility functions
```

## Backend (NestJS) Structure

```
/apps/api
  /src
    /auth
      auth.controller.ts
      auth.module.ts
      auth.service.ts
      jwt.strategy.ts
    /users
      dto/
      entities/
      users.controller.ts
      users.module.ts
      users.service.ts
    /wallets
      dto/
      entities/
      wallets.controller.ts
      wallets.module.ts
      wallets.service.ts
    /balances
      dto/
      entities/
      balances.controller.ts
      balances.module.ts
      balances.service.ts
    /config
      config.module.ts
      config.service.ts
    /database
      database.module.ts
    main.ts
    app.module.ts
  /.env
  /docker-compose.yml
```

## Frontend (Next.js) Structure

```
/apps/web
  /app
    /components
      /auth
        SignInForm.tsx
        SignUpForm.tsx
      /wallet
        AddWalletForm.tsx
        WalletList.tsx
        WalletBalance.tsx
      /ui
        Navbar.tsx
        Sidebar.tsx
    /lib
      api.ts
      utils.ts
      auth.ts
    /auth
      signin/page.tsx
      signup/page.tsx
    /dashboard
      page.tsx
    /wallet
      page.tsx
      add/page.tsx
      [id]/page.tsx
    layout.tsx
    page.tsx
  /.env
```

## Shared UI Components

```
/packages/ui
  /src
    button.tsx
    card.tsx
    input.tsx
    select.tsx
    badge.tsx
    dialog.tsx
    dropdown.tsx
```

## Database Schema

### Users Table
- id (UUID, primary key)
- email (string, unique)
- password_hash (string)
- created_at (timestamp)
- updated_at (timestamp)

### Wallets Table
- id (UUID, primary key)
- user_id (UUID, foreign key)
- name (string)
- address (string)
- network (enum: SOLANA, ETHEREUM, etc.)
- created_at (timestamp)
- updated_at (timestamp)

### Balances Cache Table (Optional)
- id (UUID, primary key)
- wallet_id (UUID, foreign key)
- token_address (string, nullable)
- amount (decimal)
- usd_value (decimal)
- last_updated (timestamp)