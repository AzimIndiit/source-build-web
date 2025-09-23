import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import LazyImage from '@/components/common/LazyImage';
import { cn, formatCurrency } from '@/lib/helpers';
import { BreadcrumbWrapper } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { getColorName } from '@/utils/colorUtils';
import { EmptyState } from '@/components/common/EmptyState';
import CartEmptyIcon from '@/assets/svg/cartItemEmptyState.svg';
import CartSkeleton from '../components/CartSkeleton';
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '@/hooks/useCart';
import { CartItem } from '@/services/cart.service';
import useCartStore from '@/stores/cartStore';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const syncWithAPI = useCartStore((state) => state.syncWithAPI);
  const [updatingItemId, setUpdatingItemId] = React.useState<string | null>(null);

  // Cart hooks
  const { data: cart, isLoading, isFetching } = useCart();
  const updateCartMutation = useUpdateCartItem();
  const removeCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  // Sync cart data with Zustand store whenever it changes
  useEffect(() => {
    if (cart && !isLoading && !isFetching) {
      syncWithAPI(cart, 'replace');
    }
  }, [cart, isLoading, isFetching, syncWithAPI]);

  const items = cart?.items || [];
  const totalPrice = items.reduce(
    (total, item) => total + (item.currentPrice ?? 0) * item.quantity,
    0
  );
  // const shippingCost = 0; // Free shipping or calculate based on items
  // const tax = totalPrice * 0.08; // 8% tax rate
  const finalTotal = totalPrice;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cart', isCurrentPage: true },
  ];

  const handleQuantityChange = (item: CartItem, increment: boolean) => {
    const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;
    if (newQuantity < 1) return;

    const itemId = `${item.productId}${item.variantId ? `-${item.variantId}` : ''}`;
    setUpdatingItemId(itemId);

    updateCartMutation.mutate(
      {
        productId: item.productId,
        variantId: item.variantId,
        quantity: newQuantity,
      },
      {
        onSettled: () => {
          setUpdatingItemId(null);
        },
      }
    );
  };

  const handleRemoveItem = (item: CartItem) => {
    removeCartMutation.mutate({
      productId: item.productId,
      variantId: item.variantId,
    });
  };

  const handleClearCart = () => {
    clearCartMutation.mutate();
  };

  const handleCheckout = () => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login with return location
      navigate('/auth/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      // User is logged in, proceed to checkout
      navigate('/checkout');
    }
  };

  if (isLoading || isFetching) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-140px))] flex items-center justify-center">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!"
          icon={<img src={CartEmptyIcon} alt="Cart empty" className="h-64 w-auto" />}
          action={{
            label: 'Continue Shopping',
            onClick: () => navigate('/marketplace'),
          }}
          className="min-h-[600px]"
        />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="">
        <BreadcrumbWrapper items={breadcrumbItems} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center gap-2 border-b pb-2 border-gray-200">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Cart</h1>({' '}
              <span className="text-lg text-gray-600">{items.length} items</span>)
            </div>

            {/* Clear Cart Button */}
            <div className="">
              <Button
                leftIcon={Trash2}
                variant="outline"
                onClick={handleClearCart}
                disabled={clearCartMutation.isPending}
                className="text-red-600 bg-white h-10 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Clear Cart
              </Button>
            </div>
          </div>
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => {
              const currentPrice = item.currentPrice ?? 0;
              const originalPrice = item.originalPrice ?? 0;
              const isOutOfStock = item.outOfStock === true;
              const isDeleted = item.isDeleted === true;
              // Create a unique ID for the item
              const itemId = `${item.productId}${item.variantId ? `-${item.variantId}` : ''}`;

              return (
                <Card className="p-4 sm:p-6 border-gray-200" key={itemId}>
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <LazyImage
                        src={item.product?.images?.[0] || ''}
                        alt={item.product?.title || 'Product'}
                        className="rounded-lg"
                        wrapperClassName="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100"
                        fallbackSrc="https://placehold.co/150x150"
                        objectFit="cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <Link
                            to={isDeleted ? '#' : `/products/${item.product?.slug || ''}`}
                            className={cn(
                              'text-lg font-semibold transition-colors line-clamp-2',
                              isDeleted
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-900 hover:text-primary'
                            )}
                            onClick={isDeleted ? (e) => e.preventDefault() : undefined}
                          >
                            {item.product?.title || 'Unknown Product'}
                          </Link>

                          {/* Status badges */}
                          {isDeleted && (
                            <span className="inline-block px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded mt-1">
                              Product no longer available
                            </span>
                          )}
                          {!isDeleted && isOutOfStock && (
                            <span className="inline-block px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded mt-1">
                              Out of stock
                            </span>
                          )}

                          {/* Variant Information */}
                          {item.product?.color && (
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Color:</span>
                                <div className="flex items-center gap-1">
                                  <div
                                    className="w-5 h-5 rounded-full border-2 border-gray-300"
                                    style={{ backgroundColor: item.product.color }}
                                    title={getColorName(item.product.color).name}
                                  />
                                  <span className="text-sm text-gray-700 capitalize">
                                    {getColorName(item.product.color).name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Size information */}
                          {item.product?.size && (
                            <div className="text-sm text-gray-600 mt-1">
                              <span>Size:</span>{' '}
                              <span className="font-medium">{item.product.size}</span>
                            </div>
                          )}

                          {/* Additional attributes */}
                          {item.product?.attributes &&
                            Object.keys(item.product.attributes).length > 0 && (
                              <div className="flex flex-wrap gap-3 mt-1">
                                {Object.entries(item.product.attributes).map(([key, value]) => {
                                  if (key === 'color' || key === 'size') return null; // Already displayed above
                                  return (
                                    <div key={key} className="text-sm text-gray-600">
                                      <span className="capitalize">{key}:</span>{' '}
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          {item.product?.brand && (
                            <p className="text-sm text-gray-500 mt-1">
                              Brand: {item.product.brand}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item)}
                          disabled={removeCartMutation.isPending}
                          className={cn(
                            'text-red-500 hover:text-red-600 transition-colors p-1 cursor-pointer',
                            removeCartMutation.isPending && 'opacity-50 cursor-not-allowed'
                          )}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          {/* Show original price with strikethrough if there's a discount */}
                          {originalPrice > currentPrice && (
                            <span className="text-base line-through text-gray-400">
                              {formatCurrency(originalPrice)}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(currentPrice)}
                            </span>
                            <span className="text-sm text-gray-500">/ each</span>
                          </div>
                          {/* Show if price changed since adding to cart */}
                          {/* Price change indicator removed since we now use real-time pricing */}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center bg-gray-100 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item, false)}
                            disabled={
                              item.quantity <= 1 ||
                              updatingItemId === itemId ||
                              isOutOfStock ||
                              isDeleted
                            }
                            className={cn(
                              'p-2 hover:bg-gray-200 transition-colors rounded-l-lg cursor-pointer',
                              (item.quantity <= 1 ||
                                updatingItemId === itemId ||
                                isOutOfStock ||
                                isDeleted) &&
                                'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <Minus className="h-5 w-5 text-gray-600" />
                          </button>
                          <span className="px-4 py-2 text-sm font-semibold min-w-[50px] text-center flex items-center justify-center">
                            {updatingItemId === itemId ? (
                              <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item, true)}
                            disabled={
                              item.quantity >= (item.stockQuantity ?? 99) ||
                              updatingItemId === itemId ||
                              isOutOfStock ||
                              isDeleted
                            }
                            className={cn(
                              'p-2 hover:bg-gray-200 transition-colors rounded-r-lg cursor-pointer',
                              (item.quantity >= (item.stockQuantity ?? 99) ||
                                updatingItemId === itemId ||
                                isOutOfStock ||
                                isDeleted) &&
                                'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <Plus className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal for this item */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Subtotal</span>
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(currentPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(totalPrice)}</span>
              </div>
              {/* <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div> */}
              <div className="border-t pt-3 border-gray-200">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Button variant="outline" className="px-4">
                  Apply
                </Button>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-base"
            >
              Proceed to Checkout
            </Button>

            {/* Security Note */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">🔒 Secure checkout powered by Stripe</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
