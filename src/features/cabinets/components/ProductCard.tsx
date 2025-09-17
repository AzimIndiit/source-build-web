import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';
import StockSvgComponent from './StockSvgComponent';
import LabeledSwitch from './LabeledSwitch';
import { CabinetDetailProduct } from '../types';

interface ProductCardProps {
  product: CabinetDetailProduct;
  productImage?: string;
  onQuantityChange: (newQuantity: number) => void;
  onAssemblyChange: (assemblyType: 'rta' | 'assembled') => void;
  onAddToCart: (product: CabinetDetailProduct) => void;
  showAssemblyLabels?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  productImage,
  onQuantityChange,
  onAssemblyChange,
  onAddToCart,
  showAssemblyLabels = false,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          {productImage && (
            <img
              src={productImage}
              alt={product.model}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div className="text-right">
            <h5 className="font-semibold">{product.model}</h5>
            <p className="text-xl font-bold text-primary">${product.price}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{product.description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-gray-600">Assembly:</Label>
            <LabeledSwitch
              checked={product.assembly === 'assembled'}
              onCheckedChange={(checked) => onAssemblyChange(checked ? 'assembled' : 'rta')}
              showLabels={showAssemblyLabels}
              onLabel="Assembled"
              offLabel="RTA"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-gray-600">In Stock:</Label>
            <StockSvgComponent color={product.inStock ? '#42B72A' : '#FF0000'} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onQuantityChange(product.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{product.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onQuantityChange(product.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" onClick={() => onAddToCart(product)} disabled={!product.inStock}>
              Add to cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
