import React from 'react';
import { CabinetCollection, CabinetProduct } from '../types';
import CabinetProductCard from './CabinetProductCard';

interface CabinetCollectionGridProps {
  collections: CabinetCollection[];
  onProductClick: (product: CabinetProduct) => void;
  gridClassName?: string;
}

const CabinetCollectionGrid: React.FC<CabinetCollectionGridProps> = ({
  collections,
  onProductClick,
  gridClassName = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
}) => {
  return (
    <div className="space-y-12">
      {collections.map((category, categoryIndex) => (
        <div key={categoryIndex} className="space-y-6">
          <h2 className="text-2xl font-semibold">{category.categoryName}</h2>
          <div className={`grid ${gridClassName} gap-4`}>
            {category.products.map((product) => (
              <CabinetProductCard key={product.id} product={product} onShopNow={onProductClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CabinetCollectionGrid;
