import { ComponentType, lazy } from 'react';

/**
 * Creates a delayed lazy component that will show Suspense loader
 * @param importFunc - The dynamic import function
 * @param delay - Delay in milliseconds
 */
export function lazyWithDelay<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  delay: number = 2000
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve) => {
      setTimeout(() => {
        importFunc().then(resolve);
      }, delay);
    });
  });
}

/**
 * Alternative: Create a delayed version of any component
 * This wraps the component and adds a delay before rendering
 */
export function delayedComponent<P extends object>(
  Component: ComponentType<P>,
  delay: number = 2000
): ComponentType<P> {
  return (props: P) => {
    throw new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  };
}