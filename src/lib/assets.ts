/**
 * Asset path utilities for Vite-based projects
 * Provides type-safe asset imports with proper Vite handling
 */

/**
 * Get the URL for a static asset from the /src/assets directory
 * This uses Vite's static asset handling for optimal performance
 * 
 * @param path - The relative path from the assets folder (e.g., 'auth/vector.svg')
 * @returns The resolved asset URL
 * 
 * @example
 * // Direct usage in img tag:
 * import { getAssetUrl } from '@/lib/assets';
 * 
 * function MyComponent() {
 *   return <img src={getAssetUrl('auth/vector.svg')} alt="Logo" />;
 * }
 */
export function getAssetUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Use Vite's URL constructor with import.meta.url for proper asset resolution
  // This ensures assets are properly handled during build
  return new URL(`../assets/${cleanPath}`, import.meta.url).href;
}

/**
 * Type-safe asset imports with proper typing
 * Use this when you need to import assets as modules
 * 
 * @example
 * // Import SVG as React component (requires vite-plugin-svgr):
 * import VectorIcon from '@/assets/auth/vector.svg?react';
 * 
 * // Import image with metadata:
 * import logoUrl from '@/assets/logo.png';
 */
export type AssetImport = {
  default: string;
  // Additional metadata can be added based on your Vite plugins
};

/**
 * Helper to construct asset paths for CSS url() references
 * 
 * @param path - The relative path from the assets folder
 * @returns A CSS-compatible URL string
 * 
 * @example
 * // In CSS-in-JS:
 * const styles = {
 *   backgroundImage: getCssAssetUrl('backgrounds/hero.jpg')
 * };
 */
export function getCssAssetUrl(path: string): string {
  return `url('${getAssetUrl(path)}')`;
}

/**
 * Preload an image asset for better performance
 * 
 * @param path - The relative path from the assets folder
 * @returns Promise that resolves when the image is loaded
 * 
 * @example
 * // Preload critical images:
 * useEffect(() => {
 *   preloadImage('hero/banner.jpg');
 * }, []);
 */
export function preloadImage(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = getAssetUrl(path);
  });
}

/**
 * Get all assets from a specific directory (requires glob import)
 * This is useful for galleries or dynamic asset loading
 * 
 * @example
 * // Import all images from a directory:
 * const images = import.meta.glob('@/assets/gallery/*.{png,jpg,jpeg,svg}', { eager: true });
 */
export function getAssetsFromDirectory(pattern: string): Record<string, AssetImport> {
  // This is a type helper - actual implementation would use import.meta.glob
  return {} as Record<string, AssetImport>;
}