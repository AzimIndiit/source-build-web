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
- Run single test file: `npm test path/to/file.test.tsx`

## Architecture Overview

### Tech Stack
- **React 19** with **TypeScript** (strict mode enabled)
- **Vite** as build tool with hot reload
- **TailwindCSS v4** with custom Figma-based design system
- **React Router v7** with lazy loading and role-based routing
- **TanStack Query** for server state management
- **React Hook Form + Zod** for form validation
- **Axios** with interceptors for API calls and token refresh
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Zustand** for client state (only when needed)

### Project Structure
The codebase follows a **feature-based architecture** with these key directories:

- `src/features/` - Feature modules (auth, dashboard, orders, products, messages, notifications, profile, vehicle, etc.)
- `src/components/` - Shared UI components (forms, navigation, charts, ui)
- `src/app/` - App-level concerns (layouts, providers, routing)
- `src/lib/` - Utilities and configurations (axios, helpers, utils, queryClient)
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `src/stores/` - Zustand stores when needed

### Key Architectural Patterns

#### 1. Role-Based Access Control
The app supports three user roles with dedicated layouts and routes:
- **Driver**: `/driver/*` routes with DriverLayout
- **Seller**: `/seller/*` routes with SellerLayout  
- **General**: `/dashboard/*` routes with DashboardLayout

Routes are protected using `ProtectedRoute` component with `allowedRoles` prop. Role-based routing is configured in `src/app/routes/router.tsx`.

#### 2. API Integration
All API calls go through `src/lib/axios.ts` which includes:
- Base URL configuration via `VITE_API_BASE_URL` (defaults to `http://localhost:8000/api`)
- Automatic JWT token attachment from localStorage (`access_token`)
- Token refresh logic with request queuing (using `refresh_token`)
- 401 error handling with automatic logout and redirect to `/login`
- 30-second timeout for requests
- Interceptors for request/response handling

#### 3. State Management Strategy
- **Server state**: TanStack Query for caching, mutations, and synchronization
- **Client state**: Zustand (only when needed, prefer React state)
- **Form state**: React Hook Form with Zod schema validation
- **URL state**: React Router for navigation and query params

#### 4. Design System Integration
The project implements a Figma-based design system with:
- Custom CSS variables in `src/styles/index.css` for colors, spacing, typography
- TailwindCSS v4 configuration (Note: theme extensions currently commented out in `tailwind.config.ts`)
- Helvetica Neue font family with multiple weights (100-900)
- Design tokens:
  - Primary color: `#2b5aac`
  - Background: `#f2f4f7`
  - Spacing scale: `xs` (4px) to `9xl` (67px)
  - Border radius: `sm` (10px) and `md` (20px)
  - Shadow: `0px 0px 15.7px 0px rgba(0, 0, 0, 0.25)`

### Import Paths
Absolute imports are configured in both Vite and Vitest configs:
- `@/` - src root
- `@/components` - shared components
- `@/features` - feature modules
- `@/lib` - utilities and lib files
- `@/hooks` - custom hooks
- `@/types` - TypeScript types
- `@/app` - app-level files
- `@/styles` - style files

### Testing Setup
- **Vitest** with jsdom environment
- **React Testing Library** for component testing
- **@testing-library/user-event** for interaction testing
- Setup file: `src/tests/setup.ts`
- Tests should be co-located with features or in `src/tests/`

## Development Rules (from PROJECT_RULES.md)

- Use TypeScript only (no `.js` files)
- All APIs must go through `lib/axios.ts` with interceptors
- Server state → TanStack Query
- Client state → Zustand (only if needed, prefer React state)
- Forms → React Hook Form + Zod
- Feature-based folder structure (`auth/`, `orders/`, `products/`, etc.)
- Role-based routing (DriverLayout, SellerLayout)
- UI must use Tailwind v4 + Shadcn with variants
- Write unit tests for hooks/components + E2E tests for login/order flows
- Use absolute imports via `@/` paths

### Component Development
- Follow existing patterns in `src/components/ui/`
- Use class-variance-authority (cva) for component variants
- Implement proper TypeScript interfaces
- Use forwardRef for form components
- Follow the established naming conventions

### Common Utilities
- `cn()` - Class name utility from `@/lib/utils` for merging Tailwind classes
- `truncateFilename()` - File name truncation utility
- `getInitials()` - Get initials from name in `@/lib/helpers`
- Date utilities in `@/lib/date-utils`
- Color utilities in `@/lib/color-utils`
- Test utilities in `@/lib/test-utils`

### Error Handling
- Use React Error Boundary for component errors (`src/features/error/pages/ErrorBoundary.tsx`)
- Router error boundary for navigation errors (`src/features/error/pages/RouterErrorBoundary.tsx`)
- Toast notifications via `react-hot-toast` for user feedback
- Axios interceptors handle API errors and token refresh automatically