import { lazyWithDelay } from '@/lib/delay-component';

// Create a delayed version of the SlowLoadingPage
const DelayedSlowLoadingPage = lazyWithDelay(
  () => import('../pages/SlowLoadingPage'),
  3000 // 3 second delay
);

export default DelayedSlowLoadingPage;
