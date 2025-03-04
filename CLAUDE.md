# OnePort Development Guide

## Commands
- Build: `npm run build` (all) or `npm run build -w <package>`
- Lint: `npm run lint` (all) or `npm run lint -w <package>`
- Type Check: `npm run check-types` (all) or `npm run check-types -w <package>`
- Run app: `npm run dev -w <app>` (e.g., `npm run dev -w apps/web`)

## Code Style
- **TypeScript**: Strict mode with `noUncheckedIndexedAccess`
- **Formatting**: Follows Prettier defaults
- **React**: Uses new JSX transform (no React import needed)
- **Imports**: ES modules format, NodeNext resolution
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error Handling**: Try/catch with typed errors

## Project Structure
- Turborepo monorepo with shared configs and packages
- Next.js apps in `/apps` directory
- Shared components in `/packages/ui`
- Consistent ESLint and TypeScript configs across packages