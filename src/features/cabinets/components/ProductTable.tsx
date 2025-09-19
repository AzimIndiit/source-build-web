import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import StockSvgComponent from './StockSvgComponent';
import LabeledSwitch from './LabeledSwitch';
import { CabinetDetailProduct } from '../types';
import { formatCurrency } from '@/lib/helpers';

interface ProductTableProps {
  products: CabinetDetailProduct[];
  sectionImage?: string;
  onQuantityChange: (productIndex: number, newQuantity: number) => void;
  onAssemblyChange: (productIndex: number, assemblyType: 'rta' | 'assembled') => void;
  onAddToCart: (product: CabinetDetailProduct) => void;
  showAssemblyLabels?: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  sectionImage,
  onQuantityChange,
  onAssemblyChange,
  onAddToCart,
  showAssemblyLabels = false,
}) => {
  return (
    <div className="flex gap-4">
      {sectionImage && (
        <div className="w-32 h-32 flex-shrink-0">
          <img
            src={sectionImage}
            alt="Product section"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      )}

      <div className="flex-1 overflow-x-auto  border-2 border-gray-200 rounded-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200  text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-semibold  min-w-[120px]">Model</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-center px-4 py-3 font-semibold">Qty</th>
              <th className="text-center px-4 py-3 font-semibold">Assembly</th>
              <th className="text-center px-4 py-3 font-semibold">Price</th>
              <th className="text-center px-4 py-3 font-semibold min-w-[100px]">In Stock</th>
              <th className="text-center px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, productIndex) => (
              <tr
                key={product.id}
                className={productIndex === products.length - 1 ? '' : 'border-b border-gray-200'}
              >
                <td className="px-4 py-4 font-medium">{product.model}</td>
                <td className="px-4 py-4 text-gray-600">{product.description}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-2 bg-white rounded-sm shadow-sm">
                    <Button
                      variant="outline"
                      size="icon"
                      className=" border-none"
                      onClick={() => onQuantityChange(productIndex, product.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className=" text-center font-medium">{product.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className=" border-none"
                      onClick={() => onQuantityChange(productIndex, product.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <LabeledSwitch
                      checked={product.assembly === 'assembled'}
                      onCheckedChange={(checked) =>
                        onAssemblyChange(productIndex, checked ? 'assembled' : 'rta')
                      }
                      showLabels={showAssemblyLabels}
                      onLabel="Assembled"
                      offLabel="RTA"
                    />
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-semibold">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <StockSvgComponent color={product.inStock ? '#42B72A' : '#FF0000'} />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      className="text-gray-600 hover:text-white bg-gray-300 rounded-sm hover:bg-primary"
                      onClick={() => onAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      Add to cart
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
