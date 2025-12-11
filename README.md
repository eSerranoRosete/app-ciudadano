# React + TypeScript + Vite App Template

A modern React application template with a carefully selected tech stack for building scalable web applications.

## Tech Stack

### Core
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** (Rolldown) - Fast build tool with HMR
- **Tailwind CSS v4** - Utility-first CSS framework

### Key Libraries

#### UI Components
- **[HeroUI](https://www.heroui.com/)** - Modern React component library
  - Pre-built accessible components
  - Built on top of Tailwind CSS
  - Integrates with Framer Motion for animations

#### Routing
- **[TanStack Router](https://tanstack.com/router)** - Type-safe routing
  - File-based routing (routes in `src/routes/`)
  - Automatic route tree generation
  - Full TypeScript support with type inference

#### Data Fetching
- **[TanStack Query](https://tanstack.com/query)** - Async state management
  - Server state synchronization
  - Caching and background updates
  - Configured in `src/providers.tsx`

#### State Management
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
  - Simple, unopinionated state management
  - No boilerplate required
  - TypeScript-first

#### Form Handling
- **[React Hook Form](https://react-hook-form.com/)** - Performant form validation
  - Minimal re-renders
  - Integrates with Zod via `@hookform/resolvers`
  - **[Zod](https://zod.dev/)** - Schema validation

## Project Structure

```
src/
├── routes/          # File-based routes (TanStack Router)
│   ├── __root.tsx   # Root layout component
│   └── index.tsx    # Home page
├── providers.tsx    # App providers (Query, HeroUI)
├── main.tsx         # App entry point
├── routeTree.gen.ts # Auto-generated route tree
└── index.css        # Global styles
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```
