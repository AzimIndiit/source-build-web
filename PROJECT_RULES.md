# 🚀 Project Rules – Source Build

## Tech Stack
- React 19 (Vite)
- TypeScript
- TailwindCSS v4
- Shadcn/UI
- TanStack Query + Axios
- React Router v7
- React Hook Form + Zod
- Framer Motion
- Vitest + React Testing Library + Playwright

## Rules
- Use TypeScript only (no `.js`).
- All APIs must go through `lib/axios.ts` (with interceptors).
- Server state → TanStack Query.
- Client state → Zustand (only if needed).
- Forms → React Hook Form + Zod.
- Feature-based folder structure (`auth/`, `orders/`, `products/`…).
- Role-based routing (DriverLayout, SellerLayout).
- UI must use Tailwind v4 + Shadcn with variants.
- Write unit tests for hooks/components + E2E tests for login/order flows.
- Absolute imports via `@/` paths.
