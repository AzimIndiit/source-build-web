import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import useCartStore from '@/stores/cartStore';
import LazyImage from '@/components/common/LazyImage';
import { cn, formatCurrency } from '@/lib/helpers';
import { BreadcrumbWrapper } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  const totalPrice = getTotalPrice();
  const shippingCost = 0; // Free shipping or calculate based on items
  const tax = totalPrice * 0.08; // 8% tax rate
  const finalTotal = totalPrice + shippingCost + tax;



  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cart', isCurrentPage: true },
  ];

  const handleQuantityChange = (id: string, currentQuantity: number, increment: boolean) => {
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;
    updateQuantity(id, newQuantity);
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

  if (items.length === 0) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Start shopping to find amazing
          products!
        </p>
        <Button
          onClick={() => navigate('/marketplace')}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
        >
          Continue Shopping
        </Button>
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
                onClick={clearCart}
                className="text-red-600 bg-white h-10 hover:text-red-700 border-red-200 hover:border-red-300"
              >
              Clear Cart
              </Button>
            </div>
          </div>
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <Card className="p-4 sm:p-6 border-gray-200" key={item.id}>
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <LazyImage
                      src={item.image}
                      alt={item.title}
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
                          to={`/products/${item.slug}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.title}
                        </Link>

                        {/* Variant Information */}
                        {item.color && (
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Color:</span>
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-5 h-5 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-gray-700 capitalize">
                                  {item.color}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional variant options if any */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-1">
                            {Object.entries(item.selectedOptions).map(([key, value]) => {
                              if (key === 'color') return null; // Already displayed above
                              return (
                                <div key={key} className="text-sm text-gray-600">
                                  <span className="capitalize">{key}:</span>{' '}
                                  <span className="font-medium">{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {item.seller && (
                          <p className="text-sm text-gray-500 mt-1">
                            Sold by: {item.seller.businessName}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(item.price)}
                        </span>
                        <span className="text-sm text-gray-500">/ each</span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, false)}
                          disabled={item.quantity <= 1}
                          className={cn(
                            'p-2 hover:bg-gray-200 transition-colors rounded-l-lg cursor-pointer',
                            item.quantity <= 1 && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="px-4 py-2 text-sm font-semibold min-w-[50px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, true)}
                          disabled={item.quantity >= item.maxQuantity}
                          className={cn(
                            'p-2 hover:bg-gray-200 transition-colors rounded-r-lg cursor-pointer',
                            item.quantity >= item.maxQuantity && 'opacity-50 cursor-not-allowed'
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
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(finalTotal)}</span>
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
