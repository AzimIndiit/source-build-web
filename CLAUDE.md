# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server (runs on port 3000, opens browser automatically)
- `npm run build` - Build for production (runs TypeScript compiler + Vite build)
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint with TypeScript rules (max 0 warnings)
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report

## Architecture Overview

### Tech Stack
- **React 19** with **TypeScript** (strict mode enabled)
- **Vite** as build tool with hot reload
- **TailwindCSS v4** with custom Figma-based design system
- **React Router v7** with lazy loading and role-based routing
- **TanStack Query** for server state management
- **React Hook Form + Zod** for form validation
- **Axios** with interceptors for API calls and token refresh

### Project Structure
The codebase follows a **feature-based architecture** with these key directories:

- `src/features/` - Feature modules (auth, dashboard, orders, products, etc.)
- `src/components/` - Shared UI components (forms, navigation, charts)
- `src/app/` - App-level concerns (layouts, providers, routing)
- `src/lib/` - Utilities and configurations (axios, design-system, helpers)
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions

### Key Architectural Patterns

#### 1. Role-Based Access Control
The app supports three user roles with dedicated layouts and routes:
- **Driver**: `/driver/*` routes with DriverLayout
- **Seller**: `/seller/*` routes with SellerLayout  
- **General**: `/dashboard/*` routes with DashboardLayout

Routes are protected using `ProtectedRoute` component with `allowedRoles` prop.

#### 2. API Integration
All API calls go through `src/lib/axios.ts` which includes:
- Base URL configuration via `VITE_API_BASE_URL`
- Automatic JWT token attachment from localStorage
- Token refresh logic with request queuing
- 401 error handling with automatic logout

#### 3. State Management Strategy
- **Server state**: TanStack Query for caching, mutations, and synchronization
- **Client state**: Zustand (only when needed, prefer React state)
- **Form state**: React Hook Form with Zod schema validation

#### 4. Design System Integration
The project implements a Figma-based design system with:
- Custom CSS variables in `src/styles/index.css`
- Extended Tailwind config with Figma tokens (`tailwind.config.js`)
- Design utilities in `src/lib/design-system.ts`
- Consistent spacing, colors, typography, and component sizing

### Import Paths
Absolute imports are configured for:
- `@/*` - src root
- `@/components/*` - shared components
- `@/features/*` - feature modules
- `@/lib/*` - utilities and lib files
- `@/hooks/*` - custom hooks
- `@/types/*` - TypeScript types
- `@/app/*` - app-level files

### Testing Setup
- **Vitest** with jsdom environment
- **React Testing Library** for component testing
- **@testing-library/user-event** for interaction testing
- Setup file: `src/tests/setup.ts`
- Tests should be co-located with features or in `src/tests/`

## Development Rules

### Code Standards (from PROJECT_RULES.md)
- Use TypeScript only (no `.js` files)
- All APIs must go through `lib/axios.ts`
- Server state → TanStack Query
- Client state → Zustand (only if needed)
- Forms → React Hook Form + Zod
- Feature-based folder structure
- UI must use Tailwind v4 + Shadcn with variants
- Write unit tests for hooks/components + E2E tests for critical flows

### Design System Usage
- Use Figma design tokens via Tailwind classes (e.g., `bg-figma-primary`, `text-figma-lg`)
- Follow the precise spacing system (`figma-xs` through `figma-9xl`)
- Use Helvetica Neue font family (`font-helvetica`)
- Apply consistent shadows (`shadow-figma`) and border radius (`rounded-figma-sm/md`)

### Component Development
- Follow existing patterns in `src/components/ui/`
- Use class-variance-authority for component variants
- Implement proper TypeScript interfaces
- Use forwardRef for form components
- Follow the established naming conventions