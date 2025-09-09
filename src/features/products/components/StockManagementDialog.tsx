import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, AlertCircle, Plus, Minus, Box, Layers } from 'lucide-react';
import { cn } from '@/lib/helpers';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { Switch } from '@/components/ui/switch';

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
  quantity: number;
  outOfStock?: boolean;
  variants?: Variant[];
  status: string;
}

interface StockManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdateStock: (
    productId: string,
    quantity: number,
    variants?: Array<{ index: number; quantity: number; outOfStock?: boolean }>,
    outOfStock?: boolean
  ) => Promise<void>;
}

const StockManagementDialog: React.FC<StockManagementDialogProps> = ({
  isOpen,
  onClose,
  product,
  onUpdateStock,
}) => {
  const [mainQuantity, setMainQuantity] = useState(0);
  const [mainOutOfStock, setMainOutOfStock] = useState(false);
  const [variantQuantities, setVariantQuantities] = useState<number[]>([]);
  const [variantOutOfStock, setVariantOutOfStock] = useState<boolean[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<'update' | 'out-of-stock' | 'in-stock' | null>(
    null
  );

  useEffect(() => {
    if (product) {
      setMainQuantity(product.quantity || 0);
      setMainOutOfStock(product.outOfStock || false);
      if (product.variants) {
        setVariantQuantities(product.variants.map((v) => v.quantity || 0));
        setVariantOutOfStock(product.variants.map((v) => v.outOfStock || false));
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
    setMainQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (mainQuantity > 0) {
      setMainQuantity((prev) => prev - 1);
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
          ? variantQuantities.map((quantity, index) => ({ 
              index, 
              quantity,
              outOfStock: variantOutOfStock[index]
            }))
          : undefined;
        await onUpdateStock(productId, mainQuantity, variantUpdates, mainOutOfStock);
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
          <p>
            You are about to update the stock for <strong>{product.title}</strong>:
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              • Main Stock: <strong>{mainQuantity}</strong> units
            </p>
            {product.variants && product.variants.length > 0 && (
              <p>• {product.variants.length} variant(s) will also be updated</p>
            )}
          </div>
        </div>
      );
    } else if (pendingAction === 'out-of-stock') {
      return (
        <div>
          <p>
            This will mark <strong>{product.title}</strong> as completely out of stock:
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              • Main stock will be set to <strong>0</strong>
            </p>
            {hasVariants && (
              <p>
                • All {product.variants?.length} variant(s) will be set to <strong>0</strong>
              </p>
            )}
          </div>
        </div>
      );
    } else if (pendingAction === 'in-stock') {
      const itemsToUpdate = [];
      if (mainQuantity === 0) itemsToUpdate.push('Main stock');
      const variantsToUpdate = variantQuantities.filter((q) => q === 0).length;
      if (variantsToUpdate > 0) itemsToUpdate.push(`${variantsToUpdate} variant(s)`);

      return (
        <div>
          <p>
            This will restore stock for <strong>{product.title}</strong>:
          </p>
          <div className="mt-2 space-y-1 text-sm">
            {mainQuantity === 0 && (
              <p>
                • Main stock: 0 → <strong>10</strong> units
              </p>
            )}
            {mainQuantity > 0 && (
              <p>
                • Main stock: <strong>{mainQuantity}</strong> units (unchanged)
              </p>
            )}
            {hasVariants && variantsToUpdate > 0 && (
              <p>
                • {variantsToUpdate} variant(s) with 0 stock → <strong>10</strong> units each
              </p>
            )}
            {hasVariants && variantQuantities.filter((q) => q > 0).length > 0 && (
              <p>
                • {variantQuantities.filter((q) => q > 0).length} variant(s) will keep their current
                stock
              </p>
            )}
          </div>
        </div>
      );
    }
    return '';
  };

  if (!product) return null;

  const isOutOfStock = mainQuantity === 0;

  const hasVariants = product.variants && product.variants.length > 0;
  const hasAnyStock = mainQuantity > 0 || (hasVariants && variantQuantities.some((q) => q > 0));
  const isCompletelyOutOfStock =
    mainQuantity === 0 && (!hasVariants || variantQuantities.every((q) => q === 0));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl lg:max-w-4xl bg-white max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="sm:space-y-3">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <span>Inventory Management</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Manage stock levels for{' '}
              <span className="font-semibold text-gray-900">{product.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 sm:py-4">
            {error && (
              <Alert variant="destructive" className="rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}

            {/* Main Product Stock */}
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="main-stock"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <Box className="h-4 w-4 text-gray-500" />
                  Main Stock Quantity
                </Label>
                <div className="flex items-center justify-end text-xs text-gray-500">
               
                  <div className="flex items-center gap-2 ml-2">
                  <Label htmlFor={`main-out-of-stock`} className="text-[10px] text-gray-600">
                            Out of Stock
                          </Label>
                    <Switch
                      id="main-out-of-stock"
                      className='h-6 w-12'
                      checked={mainOutOfStock}
                      onCheckedChange={(checked) => {
                        setMainOutOfStock(checked);
                    
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={isUpdating || mainQuantity === 0 || mainOutOfStock}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl border hover:bg-gray-100 hover:border-gray-300 transition-all"
                >
                  <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <input
                  id="main-stock"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={mainQuantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  disabled={isUpdating || mainOutOfStock}
                  className="flex-1 text-center text-lg sm:text-2xl font-semibold h-10 sm:h-12 rounded-lg sm:rounded-xl border focus:border-blue-500 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-0"
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
                  disabled={isUpdating || mainOutOfStock}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl border hover:bg-gray-100 hover:border-gray-300 transition-all"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
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
                {/* Desktop: 3 cols, Tablet: 2 cols, Mobile: 1 col */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {product.variants?.map((variant, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-3 space-y-2 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 border-gray-200 flex-shrink-0"
                            style={{
                              backgroundColor:
                                variant.color.toLowerCase() === 'white'
                                  ? '#f9fafb'
                                  : variant.color.toLowerCase(),
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {variant.color}
                              </span>
                              <span className="text-xs text-gray-500">${variant.price}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Label htmlFor={`variant-out-of-stock-${index}`} className="text-[10px] text-gray-600">
                            Out of Stock
                          </Label>
                          <Switch
                            id={`variant-out-of-stock-${index}`}
                            className='h-6 w-12'
                            checked={variantOutOfStock[index] || false}
                            onCheckedChange={(checked) => {
                              const newOutOfStock = [...variantOutOfStock];
                              newOutOfStock[index] = checked;
                              setVariantOutOfStock(newOutOfStock);
                            
                            }}
                          />
                        </div>
                      </div>
                 
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => decrementVariantQuantity(index)}
                          disabled={isUpdating || variantQuantities[index] === 0 || variantOutOfStock[index]}
                          className="h-8 w-8 rounded-sm hover:bg-gray-50 transition-all p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={variantQuantities[index] || 0}
                          onChange={(e) => handleVariantQuantityChange(index, e.target.value)}
                          disabled={isUpdating || variantOutOfStock[index]}
                          className="flex-1 text-center h-8 text-xs sm:text-sm font-medium rounded-sm border focus:border-primary transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 min-w-[40px]"
                          onKeyPress={(e) => {
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
                          disabled={isUpdating || variantOutOfStock[index]}
                          className="h-8 w-8 rounded-sm hover:bg-gray-50 transition-all p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {/* <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
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
                disabled={isUpdating || hasAnyStock}
                className="flex-1 h-10 border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800 hover:border-green-400 transition-all disabled:opacity-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Mark In Stock
              </Button>
            </div>
          </div> */}
          </div>

          <div className="flex justify-center sm:justify-end flex-row gap-2 sm:gap-2 py-4 border-t border-gray-200 ">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
              className=" px-6 text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all rounded-lg w-[180px] sm:w-[124px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isUpdating}
              className={cn(
                ' px-6  text-white rounded-lg  w-[180px] sm:w-[124px] transition-all',
                isUpdating && 'opacity-70'
              )}
            >
              {isUpdating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Stock'
              )}
            </Button>
          </div>
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
