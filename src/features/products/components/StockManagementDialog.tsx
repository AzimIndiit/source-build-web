import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, AlertCircle, Plus, Minus, Box, Layers } from 'lucide-react';
import { cn } from '@/lib/helpers';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';

interface Variant {
  color: string;
  quantity: number;
  price: number;
  images?: string[];
}

interface Product {
  id?: string;
  _id?: string;
  title: string;
  quantity: number;
  variants?: Variant[];
  status: string;
}

interface StockManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdateStock: (productId: string, quantity: number, variants?: Array<{ index: number; quantity: number }>) => Promise<void>;
}

const StockManagementDialog: React.FC<StockManagementDialogProps> = ({
  isOpen,
  onClose,
  product,
  onUpdateStock,
}) => {
  const [mainQuantity, setMainQuantity] = useState(0);
  const [variantQuantities, setVariantQuantities] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<'update' | 'out-of-stock' | 'in-stock' | null>(null);

  useEffect(() => {
    if (product) {
      setMainQuantity(product.quantity || 0);
      if (product.variants) {
        setVariantQuantities(product.variants.map(v => v.quantity || 0));
      }
      setError('');
    }
  }, [product]);

  const handleQuantityChange = (value: string) => {
    // Allow empty string temporarily while typing
    if (value === '') {
      setMainQuantity(0);
      setError('');
      return;
    }
    
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '');
    
    // Parse to remove leading zeros
    // parseInt will automatically handle "00000" -> 0, "02" -> 2, etc.
    const num = parseInt(cleanValue, 10) || 0;
    
    setMainQuantity(num);
    setError('');
  };

  const handleVariantQuantityChange = (index: number, value: string) => {
    // Allow empty string temporarily while typing
    if (value === '') {
      const newQuantities = [...variantQuantities];
      newQuantities[index] = 0;
      setVariantQuantities(newQuantities);
      setError('');
      return;
    }
    
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '');
    
    // Parse to remove leading zeros
    // parseInt will automatically handle "00000" -> 0, "02" -> 2, etc.
    const num = parseInt(cleanValue, 10) || 0;
    
    const newQuantities = [...variantQuantities];
    newQuantities[index] = num;
    setVariantQuantities(newQuantities);
    setError('');
  };

  const incrementQuantity = () => {
    setMainQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (mainQuantity > 0) {
      setMainQuantity(prev => prev - 1);
    }
  };

  const incrementVariantQuantity = (index: number) => {
    const newQuantities = [...variantQuantities];
    newQuantities[index] = (newQuantities[index] || 0) + 1;
    setVariantQuantities(newQuantities);
  };

  const decrementVariantQuantity = (index: number) => {
    if (variantQuantities[index] > 0) {
      const newQuantities = [...variantQuantities];
      newQuantities[index] = newQuantities[index] - 1;
      setVariantQuantities(newQuantities);
    }
  };

  const handleSubmit = () => {
    setPendingAction('update');
    setShowConfirmation(true);
  };

  const handleQuickStockAction = (action: 'in-stock' | 'out-of-stock') => {
    setPendingAction(action);
    setShowConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    if (!product || !pendingAction) return;

    setIsUpdating(true);
    setError('');
    setShowConfirmation(false);

    try {
      const productId = product.id || product._id || '';
      
      if (pendingAction === 'update') {
        const variantUpdates = product.variants
          ? variantQuantities.map((quantity, index) => ({ index, quantity }))
          : undefined;
        await onUpdateStock(productId, mainQuantity, variantUpdates);
      } else if (pendingAction === 'out-of-stock') {
        const variantUpdates = product.variants
          ? variantQuantities.map((_, index) => ({ index, quantity: 0 }))
          : undefined;
        await onUpdateStock(productId, 0, variantUpdates);
      } else if (pendingAction === 'in-stock') {
        // If main stock is 0, set it to 10, otherwise keep current value
        const newQuantity = mainQuantity > 0 ? mainQuantity : 10;
        
        // For variants: if quantity is 0, set to 10, otherwise keep current value
        const variantUpdates = product.variants
          ? variantQuantities.map((quantity, index) => ({
              index,
              quantity: quantity > 0 ? quantity : 10
            }))
          : undefined;
        
        // Update the local state to reflect the changes
        if (mainQuantity === 0) setMainQuantity(10);
        if (product.variants) {
          const updatedVariants = variantQuantities.map(q => q > 0 ? q : 10);
          setVariantQuantities(updatedVariants);
        }
        
        await onUpdateStock(productId, newQuantity, variantUpdates);
      }
      
      onClose();
    } catch (err) {
      setError('Failed to update stock. Please try again.');
      console.error('Stock update error:', err);
    } finally {
      setIsUpdating(false);
      setPendingAction(null);
    }
  };

  const getConfirmationMessage = () => {
    if (!product) return '';
    
    if (pendingAction === 'update') {
      return (
        <div>
          <p>You are about to update the stock for <strong>{product.title}</strong>:</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>• Main Stock: <strong>{mainQuantity}</strong> units</p>
            {product.variants && product.variants.length > 0 && (
              <p>• {product.variants.length} variant(s) will also be updated</p>
            )}
          </div>
        </div>
      );
    } else if (pendingAction === 'out-of-stock') {
      return `This will mark "${product.title}" and all its variants as out of stock (quantity = 0).`;
    } else if (pendingAction === 'in-stock') {
      return `This will mark "${product.title}" as in stock with default quantities if currently at 0.`;
    }
    return '';
  };

  if (!product) return null;

  const isOutOfStock = mainQuantity === 0;
  const hasVariants = product.variants && product.variants.length > 0;
  const hasAnyStock = mainQuantity > 0 || (hasVariants && variantQuantities.some(q => q > 0));
  const isCompletelyOutOfStock = mainQuantity === 0 && (!hasVariants || variantQuantities.every(q => q === 0));

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <span>Inventory Management</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Manage stock levels for <span className="font-semibold text-gray-900">{product.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {error && (
            <Alert variant="destructive" className="rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Main Product Stock */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="main-stock" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Box className="h-4 w-4 text-gray-500" />
                Main Stock Quantity
              </Label>
              <div className="flex items-center justify-end text-xs text-gray-500">
              {/* <span>Current stock level</span> */}
              <span className={cn(
                "font-medium",
                mainQuantity > 50 ? "text-green-600" : 
                mainQuantity > 10 ? "text-yellow-600" : 
                mainQuantity > 0 ? "text-orange-600" : "text-red-600"
              )}>
                {mainQuantity > 50 ? "High Stock" : 
                 mainQuantity > 10 ? "Medium Stock" : 
                 mainQuantity > 0 ? "Low Stock" : "Out of Stock"}
              </span>
            </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={isUpdating || mainQuantity === 0}
                className="h-12 w-12 rounded-xl border-2 hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <input
                id="main-stock"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={mainQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                disabled={isUpdating}
                className="flex-1 text-center text-2xl font-semibold h-12 rounded-xl border-2 focus:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                onKeyPress={(e) => {
                  // Only allow numbers
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={isUpdating}
                className="h-12 w-12 rounded-xl border-2 hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
         
          </div>

          {/* Variant Stock */}
          {hasVariants && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-500" />
                Variant Stock
              </Label>
              <div className="space-y-3">
                {product.variants?.map((variant, index) => (
                  <div key={index} className="bg-white border-2 border-gray-100 rounded-xl p-4 space-y-3 hover:border-gray-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg border-2 border-gray-200"
                          style={{ backgroundColor: variant.color.toLowerCase() === 'white' ? '#f9fafb' : variant.color.toLowerCase() }}
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {variant.color}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ${variant.price}
                          </span>
                        </div>
                      </div>
                      {variantQuantities[index] === 0 && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5  text-red-500">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => decrementVariantQuantity(index)}
                        disabled={isUpdating || variantQuantities[index] === 0}
                        className="h-10 w-10 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={variantQuantities[index] || 0}
                        onChange={(e) => handleVariantQuantityChange(index, e.target.value)}
                        disabled={isUpdating}
                        className="flex-1 text-center h-10 text-lg font-medium rounded-lg border-2 focus:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                        onKeyPress={(e) => {
                          // Only allow numbers
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => incrementVariantQuantity(index)}
                        disabled={isUpdating}
                        className="h-10 w-10 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-medium text-amber-800 mb-3">Quick Actions</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickStockAction('out-of-stock')}
                disabled={isUpdating}
                className="flex-1 h-10 border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800 hover:border-amber-400 transition-all"
              >
                <Minus className="h-3 w-3 mr-1" />
                Mark Out of Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickStockAction('in-stock')}
                disabled={isUpdating || mainQuantity > 0}
                className="flex-1 h-10 border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800 hover:border-green-400 transition-all disabled:opacity-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Mark In Stock
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
            className=' px-6 text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all rounded-lg flex-1'
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUpdating}
            className={cn(
              ' px-6  text-white rounded-lg flex-1 transition-all',
              isUpdating && 'opacity-70'
            )}
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </span>
            ) : (
              'Update Stock'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Confirmation Modal */}
    <DeleteConfirmationModal
      isOpen={showConfirmation}
      onClose={() => {
        setShowConfirmation(false);
        setPendingAction(null);
      }}
      onConfirm={handleConfirmUpdate}
      title="Confirm Stock Update"
      description={getConfirmationMessage()}
      confirmText="Yes, Update Stock"
      cancelText="Cancel"
      isLoading={isUpdating}
    />
    </>
  );
};

export default StockManagementDialog;