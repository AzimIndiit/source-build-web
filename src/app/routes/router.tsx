import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { DriverLayout } from '@/app/layouts/DriverLayout';
import { SellerLayout } from '@/app/layouts/SellerLayout';
import { ProfileLayout } from '@/features/profile';
import { RouterErrorBoundary } from '@/features/error/pages/RouterErrorBoundary';
import SuspenseLoader from '@/components/common/SuspenseLoader';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<SuspenseLoader fullScreen />}>
        <PublicLayout />
      </Suspense>
    ),
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        index: true,
        lazy: () =>
          import('@/features/landing/pages/HomePage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'about',
        lazy: () =>
          import('@/features/landing/pages/AboutPage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'contact',
        lazy: () =>
          import('@/features/landing/pages/ContactPage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'terms',
        lazy: () =>
          import('@/features/profile/pages/TermsAndConditionsPage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'privacy',
        lazy: () =>
          import('@/features/profile/pages/TermsAndConditionsPage').then((module) => ({
            Component: module.default,
          })),
      },
    ],
  },
  {
    path: '/auth',
    element: (
      <Suspense fallback={<SuspenseLoader fullScreen />}>
        <AuthLayout />
      </Suspense>
    ),
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        path: 'login',
        lazy: () =>
          import('@/features/auth/pages/LoginPage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'signup',
        lazy: () =>
          import('@/features/auth/pages/SignupPage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'forgot-password',
        lazy: () =>
          import('@/features/auth/pages/ForgotPasswordPage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'reset-password',
        lazy: () =>
          import('@/features/auth/pages/ResetPasswordPage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'verify-otp',
        lazy: () =>
          import('@/features/auth/pages/VerifyOtpPage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'vehicle-information',
        lazy: () =>
          import('@/features/vehicle/pages/VehicleInformationPage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'driver-license',
        lazy: () =>
          import('@/features/vehicle/pages/DrivingLicenseInformationPage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: 'callback',
        lazy: () =>
          import('@/features/auth/pages/AuthRedirectPage').then((module) => ({
            Component: module.default,
          })),
      },
    ],
  },

  {
    path: 'profile',
    element: (
      <Suspense fallback={<SuspenseLoader fullScreen />}>
        <ProtectedRoute redirectTo="/auth/login" />
      </Suspense>
    ),
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ProfileLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            lazy: () =>
              import('@/features/profile/pages/ProfilePage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'my-earnings',
            lazy: () =>
              import('@/features/profile/pages/MyEarningsPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'contact-us',
            lazy: () =>
              import('@/features/profile/pages/ContactForm').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'bank',
            lazy: () =>
              import('@/features/profile/pages/ManageBankAccountsPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'address',
            lazy: () =>
              import('@/features/profile/pages/ManageSavedAddressPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'terms',
            lazy: () =>
              import('@/features/profile/pages/TermsAndConditionsPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'privacy',
            lazy: () =>
              import('@/features/profile/pages/PrivacyPolicyPage').then((module) => ({
                Component: module.default,
              })),
          },
        ],
      },
    ],
  },
  {
    path: '/driver',
    element: (
      <Suspense fallback={<SuspenseLoader fullScreen />}>
        <ProtectedRoute allowedRoles={['driver']} redirectTo="/auth/login" />
      </Suspense>
    ),
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <DriverLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            lazy: () =>
              import('@/features/dashboard/pages/DriverDashboard').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'vehicles',
            lazy: () =>
              import('@/features/vehicle/pages/VehiclesPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'vehicles/:id',
            lazy: () =>
              import('@/features/vehicle/pages/VehicleDetailsPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'orders',
            lazy: () =>
              import('@/features/orders/pages/DriverOrdersPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'orders/:id',
            lazy: () =>
              import('@/features/orders/pages/OrderDetailsPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'earnings',
            lazy: () =>
              import('@/features/dashboard/pages/EarningsPage').then((module) => ({
                Component: module.default,
              })),
          },
        ],
      },
    ],
  },
  {
    path: '/seller',
    element: (
      <Suspense fallback={<SuspenseLoader fullScreen />}>
        <ProtectedRoute allowedRoles={['seller']} redirectTo="/auth/login" />
      </Suspense>
    ),
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        element: (
          <Suspense fallback={<SuspenseLoader message="LOADING" />}>
            <SellerLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            lazy: () =>
              import('@/features/dashboard/pages/SellerDashboard').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'dashboard',
            lazy: () =>
              import('@/features/dashboard/pages/SellerDashboard').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'products',
            lazy: () =>
              import('@/features/products/pages/ProductsPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'products/create',
            lazy: () =>
              import('@/features/products/pages/CreateProductPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'products/:slug',
            lazy: () =>
              import('@/features/products/pages/ProductDetailsPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'products/:id/edit',
            lazy: () =>
              import('@/features/products/pages/EditProductPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'orders',
            lazy: () =>
              import('@/features/orders/pages/SellerOrdersPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'orders/:id',
            lazy: () =>
              import('@/features/orders/pages/OrderDetailsPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'analytics',
            lazy: () =>
              import('@/features/dashboard/pages/AnalyticsPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'notifications',
            lazy: () =>
              import('@/features/notifications/pages/NotificationsPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'messages',
            lazy: () =>
              import('@/features/messages/pages/MessagesPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'messages/:id',
            lazy: () =>
              import('@/features/messages/pages/ChatPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'test-loader',
            lazy: () =>
              import('@/features/test/components/DelayedSlowLoadingPage').then((module) => ({
                Component: module.default,
              })),
          },
          {
            path: 'test-suspense',
            lazy: () =>
              import('@/features/test/pages/TestSuspensePage').then((module) => ({
                Component: module.default,
              })),
          },
        ],
      },
    ],
  },
  {
    path: '/unauthorized',
    lazy: () =>
      import('@/features/auth/pages/UnauthorizedPage').then((module) => ({
        Component: module.default,
      })),
  },
  {
    path: '*',
    lazy: () =>
      import('@/features/error/pages/NotFoundPage').then((module) => ({
        Component: module.default,
      })),
  },
]);
