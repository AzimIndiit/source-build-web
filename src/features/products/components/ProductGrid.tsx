import React, { useState } from 'react';
import { SquarePen, Trash2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { getStatusBadgeColor } from '@/features/dashboard/utils/orderUtils';
import { cn } from '@/lib/helpers';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToggleProductStatusMutation, useUpdateProductStockMutation } from '../hooks/useProductMutations';
import StockManagementDialog from './StockManagementDialog';

interface Variant {
  color: string;
  quantity: number;
  price: number;
  images?: string[];
  outOfStock?: boolean;
}

interface Product {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  outOfStock?: boolean;
  category: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
  locationIds?: Array<{
    city: string;
    state?: string;
  }>;
  createdAt: string;
  status: string;
  variants?: Variant[];
}

interface ProductGridProps {
  product: Product;
  onProductClick: (slug: string, status: string) => void;
  onEditProduct: (e: React.MouseEvent, productId: string) => void;
  onDeleteProduct: (e: React.MouseEvent, productId: string, productTitle: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  product,
  onProductClick,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const toggleStatusMutation = useToggleProductStatusMutation();
  const updateStockMutation = useUpdateProductStockMutation();
  const productId = product.id || product._id || '';
  const isActive = product.status === 'active';

  // Calculate total stock including main product and variants
  const getTotalStock = () => {
    let totalStock = 0;
    let hasAnyStock = false;
    let isAllOutOfStock = true;

    // Check main product stock
    // Count quantity if not marked as out of stock
    if (!product.outOfStock) {
      isAllOutOfStock = false;
      if (product.quantity > 0) {
        totalStock += product.quantity;
        hasAnyStock = true;
      }
    }

    // Check variants stock
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        // Count variant quantity if not marked as out of stock
        if (!variant.outOfStock) {
          isAllOutOfStock = false;
          if (variant.quantity > 0) {
            totalStock += variant.quantity;
            hasAnyStock = true;
          }
        }
      });
    }

    // If everything is marked as out of stock, we have no stock regardless of quantities
    if (isAllOutOfStock) {
      return { totalStock: 0, hasAnyStock: false, isOutOfStock: true };
    }

    // If not all items are marked out of stock, return actual stock status
    return { totalStock, hasAnyStock, isOutOfStock: false };
  };

  const { totalStock, hasAnyStock, isOutOfStock } = getTotalStock();

  const handleToggleStatus = async (checked: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await toggleStatusMutation.mutateAsync({
        id: productId,
        status: checked ? 'active' : 'inactive',
      });
    } catch (error) {
      console.error('Failed to update product status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStockUpdate = async (
    productId: string, 
    quantity: number, 
    variants?: Array<{ index: number; quantity: number; outOfStock?: boolean }>,
    outOfStock?: boolean
  ) => {
    await updateStockMutation.mutateAsync({ 
      id: productId, 
      quantity, 
      variants,
      outOfStock 
    });
  };

  const handleStockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStockDialog(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const getLocationDisplay = (product: Product) => {
    if (product.locationIds && product.locationIds.length > 0) {
      const firstLocation = product.locationIds[0];
      if (typeof firstLocation === 'object' && firstLocation.city) {
        const display = `${firstLocation.city}, ${firstLocation.state || ''}`.trim();
        return display.length > 30 ? display.slice(0, 30) + '...' : display;
      }
    }
    return 'Location not specified';
  };

  const getImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://placehold.co/300x200.png';
  };

  return (
    <>
    <Card
      className={cn(
        'overflow-hidden border border-gray-200 rounded-xl hover:shadow-md transition-shadow p-0 cursor-pointer group gap-0',
        product.status === 'inactive' && 'grayscale'
      )}
      onClick={() => onProductClick(product.slug, product.status)}
    >
      <div className="relative">
        <img
          src={getImageUrl(product)}
          alt={product.title}
          className="w-full h-40 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/300x200.png';
          }}
        />
        {isOutOfStock || !hasAnyStock ? (
          <Badge className="absolute bottom-2 left-2 bg-red-500 text-white rounded px-2 py-1 text-[11px]">
            Out of Stock
          </Badge>
        ) : (
          <Badge className="absolute bottom-2 left-2 bg-primary text-white rounded px-2 py-1 text-[11px]">
            In Stock ({totalStock})
          </Badge>
        )}

        <Badge
          className={cn(
            'absolute bottom-2 right-2 rounded px-2 py-1 text-[11px] capitalize',
            getStatusBadgeColor(product.status)
          )}
        >
          {product.status}
        </Badge>
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-center gap-2">
          {/* Price */}
          <div className="text-[16px] font-semibold mb-1">{formatPrice(product.price)} / sq ft</div>
          <div className="flex gap-2 justify-end">

            <Button
              title="Edit"
              variant="ghost"
              size="icon"
              onClick={(e) => onEditProduct(e, product.id || product._id || '')}
              className="w-8 h-8 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-md"
            >
              <SquarePen className="w-4 h-4" />
            </Button>
            <Button
              title="Delete"
              variant="ghost"
              size="icon"
              onClick={(e) => onDeleteProduct(e, product.id || product._id || '', product.title)}
              className="w-8 h-8 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Title + Description */}
        <p className="text-[12px] text-gray-500 line-clamp-1 capitalize">{product.category}</p>
        <p className="text-[14px] text-gray-700 leading-snug line-clamp-1 mb-1 capitalize">
          {product.title}{' '}
          {product.dimensions
            ? `- ${product.dimensions.length} L x ${product.dimensions.width} W x ${product.dimensions.height} H `
            : ''}{' '}
        </p>

        {/* Location + Date + Actions */}
        <div className="flex justify-between text-[12px] text-gray-500">
          <span className="capitalize">{getLocationDisplay(product)}</span>
          <span className="text-primary capitalize">{formatDate(product.createdAt)}</span>
        </div>
        {/* Status Toggle */}
        {product.status !== 'draft' && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-2">
         <Button            onClick={handleStockClick} leftIcon={Package} variant='outline' className='text-gray-600 h-10  !text-sm hover:text-gray-600 border-gray-500 hover:bg-gray-50'>
          Manage Stock
         </Button>
            <div className="flex items-center space-x-2">
              <Label htmlFor={`status-${productId}`} className="text-xs text-gray-600">
                {isActive ? 'Active' : 'Inactive'}
              </Label>
              <Switch
                id={`status-${productId}`}
                checked={isActive}
                onCheckedChange={handleToggleStatus}
                disabled={isUpdating}
                className={cn(
                  'h-6 w-12  transition-all duration-200',
                  isUpdating && 'opacity-70',
                  isActive && 'data-[state=checked]:bg-green-500'
                )}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    
    <StockManagementDialog
      isOpen={showStockDialog}
      onClose={() => setShowStockDialog(false)}
      product={product}
      onUpdateStock={handleStockUpdate}
    />
    </>
  );
};

export default ProductGrid;
