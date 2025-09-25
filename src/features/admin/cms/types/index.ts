export enum ContentType {
  TERMS_CONDITIONS = 'terms_conditions',
  PRIVACY_POLICY = 'privacy_policy',
  ABOUT_US = 'about_us',
  PAGE = 'page',
  LANDING_PAGE = 'landing_page',
}

export interface HeroSlide {
  id: string;
  title: React.ReactNode | string;
  image: string;
  description: string;
}

export interface FeatureCard {
  id: string;
  title: string;
  icon: string;
  description?: string;
  link?: string;
}

export interface ProductItem {
  id: string;
  delivery?: string;
  image: string;
  price: string;
  description: string;
  location?: string;
  seller?: string;
  title: string;
}

export interface LandingSection {
  id: string;
  type: 'hero' | 'features' | 'products';
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  items?: (HeroSlide | FeatureCard | ProductItem)[];
  order?: number;
}

export interface CmsPage {
  _id: string;
  userId: string;
  type: ContentType;
  title: string;
  slug?: string;
  content: string;
  sections?: LandingSection[];
  isActive: boolean;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCmsPagePayload {
  type: ContentType;
  title: string;
  slug?: string;
  content: string;
  sections?: LandingSection[];
}

export interface UpdateCmsPagePayload {
  type?: ContentType;
  title?: string;
  slug?: string;
  content?: string;
  sections?: LandingSection[];
}

export interface CmsPageResponse {
  success: boolean;
  message?: string;
  data: CmsPage | CmsPage[];
}
