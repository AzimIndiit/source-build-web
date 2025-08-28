/**
 * Utility function to add delay to lazy imports for testing Suspense loaders
 * Only use this in development for testing purposes
 */
export const withDelay = <T>(importPromise: Promise<T>, delayMs: number = 2000): Promise<T> => {
  if (process.env.NODE_ENV === 'production') {
    return importPromise;
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      importPromise.then(resolve).catch(reject);
    }, delayMs);
  });
};

/**
 * Example usage in router:
 *
 * lazy: () => withDelay(
 *   import('@/features/dashboard/pages/SellerDashboard').then((module) => ({
 *     Component: module.default,
 *   })),
 *   3000 // 3 second delay
 * )
 */
