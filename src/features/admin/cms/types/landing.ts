export interface HeroItem {
  title: string;
  image?: string;
  link?: string;
  description?: string;
}

export interface HeroSection {
  id: string;
  type: 'hero';
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  items?: HeroItem[];
  order?: number;
}

export interface CategoryItem {
  title: string;
  image?: string;
  link?: string;
  description?: string;
}

export interface CategoriesSection {
  id: string;
  type: 'categories';
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  items?: CategoryItem[];
  order?: number;
}

export interface ProductItem {
  id?: string;
  title: string;
  image?: string;
  price?: string;
  priceType?: 'sqft' | 'linear' | 'pallet' | string;
  readyByDays?: string;
  link?: string;
  description?: string;
  location?: string;
  seller?: string;
}

export interface ProductSection {
  id: string;
  type: 'products';
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  productIds?: string[]; // MongoDB ObjectIds
  products?: ProductItem[]; // Populated data (for display only)
  order?: number;
}

export interface DealsSection {
  id: string;
  type: 'deals';
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  items?: Array<{
    title: string;
    image?: string;
    price?: string;
    link?: string;
    description?: string;
  }>;
  order?: number;
}

export interface FeaturesSection {
  id: string;
  type: 'features';
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  items?: Array<{
    title: string;
    image?: string;
    link?: string;
    description?: string;
  }>;
  order?: number;
}

export type LandingPageSection =
  | HeroSection
  | CategoriesSection
  | ProductSection
  | DealsSection
  | FeaturesSection
  | BannerSection
  | CollectionSection;

// Legacy types for compatibility
export interface BannerButton {
  id: string;
  title: string;
  link: string;
}

export interface BannerSection {
  id: string;
  type: 'banner';
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  buttons?: BannerButton[];
  order?: number;
}

export interface CollectionCategoryItem {
  id: string;
  name: string;
  imageUrl?: string;
  link?: string;
}

export interface CollectionSection {
  id: string;
  type: 'collection' | 'categories';
  title?: string;
  subtitle?: string;
  categoryIds?: string[]; // MongoDB ObjectIds
  categories?: CollectionCategoryItem[]; // Populated data (for display only)
  expandAllButton?: {
    title: string;
    link: string;
  };
  order?: number;
}
