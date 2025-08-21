import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { DriverLayout } from '@/app/layouts/DriverLayout';
import { SellerLayout } from '@/app/layouts/SellerLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        lazy: () => import('@/features/landing/pages/HomePage').then(module => ({ Component: module.default })),
      },
      {
        path: 'about',
        lazy: () => import('@/features/landing/pages/AboutPage').then(module => ({ Component: module.default })),
      },
      {
        path: 'contact',
        lazy: () => import('@/features/landing/pages/ContactPage').then(module => ({ Component: module.default })),
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        lazy: () => import('@/features/auth/pages/LoginPage').then(module => ({ Component: module.default })),
      },
      {
        path: 'signup',
        lazy: () => import('@/features/auth/pages/SignupPage').then(module => ({ Component: module.default })),
      },
      {
        path: 'forgot-password',
        lazy: () => import('@/features/auth/pages/ForgotPasswordPage').then(module => ({ Component: module.default })),
      },
      {
        path: 'reset-password',
        lazy: () => import('@/features/auth/pages/ResetPasswordPage').then(module => ({ Component: module.default })),
      },
      {
        path: 'verify-otp',
        lazy: () => import('@/features/auth/pages/VerifyOtpPage').then(module => ({ Component: module.default })),
      },
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            lazy: () => import('@/features/dashboard/pages/DashboardHomePage').then(module => ({ Component: module.default })),
          },
          {
            path: 'profile',
            lazy: () => import('@/features/user/pages/ProfilePage').then(module => ({ Component: module.default })),
          },
          {
            path: 'settings',
            lazy: () => import('@/features/user/pages/SettingsPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'notifications',
            lazy: () => import('@/features/notifications/pages/NotificationsPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'messages',
            lazy: () => import('@/features/messages/pages/MessagesPage').then(module => ({ Component: module.default })),
          },
        ],
      },
    ],
  },
  {
    path: '/driver',
    element: <ProtectedRoute allowedRoles={['driver']} />,
    children: [
      {
        element: <DriverLayout />,
        children: [
          {
            index: true,
            lazy: () => import('@/features/dashboard/pages/DriverDashboard').then(module => ({ Component: module.default })),
          },
          {
            path: 'vehicles',
            lazy: () => import('@/features/vehicle/pages/VehiclesPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'vehicles/:id',
            lazy: () => import('@/features/vehicle/pages/VehicleDetailsPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'orders',
            lazy: () => import('@/features/orders/pages/DriverOrdersPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'orders/:id',
            lazy: () => import('@/features/orders/pages/OrderDetailsPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'earnings',
            lazy: () => import('@/features/dashboard/pages/EarningsPage').then(module => ({ Component: module.default })),
          },
        ],
      },
    ],
  },
  {
    path: '/seller',
    element: <ProtectedRoute allowedRoles={['seller']} />,
    children: [
      {
        element: <SellerLayout />,
        children: [
          {
            index: true,
            lazy: () => import('@/features/dashboard/pages/SellerDashboard').then(module => ({ Component: module.default })),
          },
          {
            path: 'products',
            lazy: () => import('@/features/products/pages/ProductsPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'products/new',
            lazy: () => import('@/features/products/pages/CreateProductPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'products/:id',
            lazy: () => import('@/features/products/pages/ProductDetailsPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'products/:id/edit',
            lazy: () => import('@/features/products/pages/EditProductPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'orders',
            lazy: () => import('@/features/orders/pages/SellerOrdersPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'orders/:id',
            lazy: () => import('@/features/orders/pages/OrderDetailsPage').then(module => ({ Component: module.default })),
          },
          {
            path: 'analytics',
            lazy: () => import('@/features/dashboard/pages/AnalyticsPage').then(module => ({ Component: module.default })),
          },
        ],
      },
    ],
  },
  {
    path: '/unauthorized',
    lazy: () => import('@/features/auth/pages/UnauthorizedPage').then(module => ({ Component: module.default })),
  },
  {
    path: '*',
    lazy: () => import('@/features/error/pages/NotFoundPage').then(module => ({ Component: module.default })),
  },
]);