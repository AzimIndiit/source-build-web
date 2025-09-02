import React from 'react';
import { SquarePen, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { getStatusBadgeColor } from '@/features/dashboard/utils/orderUtils';
import { cn } from '@/lib/helpers';

interface Product {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
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
}

interface ProductGridProps {
  product: Product;
  onProductClick: (slug: string) => void;
  onEditProduct: (e: React.MouseEvent, productId: string) => void;
  onDeleteProduct: (e: React.MouseEvent, productId: string, productTitle: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  product,
  onProductClick,
  onEditProduct,
  onDeleteProduct,
}) => {
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
    <Card
      className="overflow-hidden border border-gray-200 rounded-xl hover:shadow-md transition-shadow p-0 cursor-pointer group gap-0"
      onClick={() => onProductClick(product.slug)}
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
        {product.quantity > 0 && (
          <Badge className="absolute bottom-2 left-2 bg-primary text-white rounded px-2 py-1 text-[11px]">
            In Stock ({product.quantity})
          </Badge>
        )}
        {product.quantity === 0 && (
          <Badge className="absolute bottom-2 left-2 bg-gray-500 text-white rounded px-2 py-1 text-[11px]">
            Out of Stock
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
          <div className="text-[16px] font-semibold mb-1">
            {formatPrice(product.price)} per sq ft
          </div>
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
          {product.dimensions
            ? `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} - `
            : ''}{' '}
          {product.title}
        </p>

        {/* Location + Date + Actions */}
        <div className="flex justify-between text-[12px] text-gray-500">
          <span className="capitalize">{getLocationDisplay(product)}</span>
          <span className="text-primary capitalize">{formatDate(product.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductGrid;
