export interface CabinetProduct {
  id: number;
  name: string;
  image: string;
  available: boolean;
  isNew: boolean;
}

export interface CabinetCollection {
  categoryName: string;
  products: CabinetProduct[];
}

export type AssemblyOption = 'RTA' | 'Assembled';

export interface CabinetDetailParams {
  productId: string;
  assemblyOption: AssemblyOption;
}

// Cabinet Detail Page Types
export interface CabinetDetailProduct {
  id: string;
  model: string;
  description: string;
  price: number;
  priceType?: 'sqft' | 'linear' | 'pallet';
  inStock: boolean;
  assembly: string | boolean;
  quantity: number;
  image: string;
  category?: string | { _id?: string; name: string; slug: string };
}

export interface CabinetSection {
  section: string;
  note: string | null;
  products: CabinetDetailProduct[];
}

export interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}
