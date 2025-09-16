import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useBlocker } from 'react-router-dom';
import {
  MapPin,
  Package,
  Truck,
  ChevronUp,
  ChevronDown,
  Plus,
  CreditCard,
  Clock3,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import useCartStore from '@/stores/cartStore';
import LazyImage from '@/components/common/LazyImage';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { formatCurrency, cn } from '@/lib/helpers';
import OrderSuccessDialog from '../components/OrderSuccessDialog';
import {
  useSavedAddresssQuery,
  useCreateSavedAddressMutation,
} from '@/features/profile/hooks/useSavedAddressMutations';
import { AddSavedAddressModal } from '@/features/profile/components/AddSavedAddressModal';
import {
  useCardsQuery,
  useCreateCardMutation,
  useDeleteCardMutation,
  useSetDefaultCardMutation,
} from '@/features/profile/hooks/useCardMutations';
import { AddCardModalStripe } from '@/features/profile/components/AddCardModalStripe';
import { SavedCardNormal } from '@/features/profile/components/SavedCardNormal';
import { useCreatePaymentIntent, useConfirmPayment } from '@/features/checkout/hooks/useCheckout';
import { getColorName } from '@/utils/colorUtils';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { items: cartItems, getTotalPrice: getCartTotalPrice, clearCart } = useCartStore();
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery' | 'shipping'>(
    'delivery'
  );
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [showAllCards, setShowAllCards] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { data: addressesResponse, refetch: refetchAddresses } =
    useSavedAddresssQuery(isAuthenticated);
  const createAddressMutation = useCreateSavedAddressMutation();
  const createPaymentIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();

  // Check if this is a "Buy Now" checkout or regular cart checkout
  const buyNowItem = location.state?.buyNowItem;
  const isBuyNow = !!buyNowItem;

  // Use buyNowItem if present, otherwise use cart items
  const items = isBuyNow ? [buyNowItem] : cartItems;

  // Calculate total price based on checkout type
  const getTotalPrice = () => {
    if (isBuyNow) {
      return buyNowItem.price * buyNowItem.quantity;
    }
    return getCartTotalPrice();
  };

  // Determine available delivery methods based on all items
  // Get delivery methods available per seller
  const getSellerDeliveryMethods = () => {
    const sellerMethods = new Map<
      string,
      {
        pickup: boolean;
        delivery: boolean;
        shipping: boolean;
        items: typeof items;
      }
    >();

    // Group items by seller
    items.forEach((item) => {
      const sellerId = item.seller?.id || 'default';
      const sellerName = item.seller?.businessName || 'Default Seller';

      if (!sellerMethods.has(sellerId)) {
        sellerMethods.set(sellerId, {
          pickup: false,
          delivery: false,
          shipping: false,
          items: [],
        });
      }

      const methods = sellerMethods.get(sellerId)!;
      methods.items.push(item);

      // Update available methods for this seller
      if (item.marketplaceOptions) {
        if (item.marketplaceOptions.pickup) methods.pickup = true;
        if (item.marketplaceOptions.delivery) methods.delivery = true;
        if (item.marketplaceOptions.shipping) methods.shipping = true;
      } else {
        // If no marketplace options specified, enable all by default
        methods.pickup = true;
        methods.delivery = true;
        methods.shipping = true;
      }
    });

    return sellerMethods;
  };

  // For backward compatibility, check if ANY method is available
  const getAvailableDeliveryMethods = () => {
    const methods = {
      pickup: false,
      delivery: false,
      shipping: false,
    };

    items.forEach((item) => {
      if (item.marketplaceOptions) {
        if (item.marketplaceOptions.pickup) methods.pickup = true;
        if (item.marketplaceOptions.delivery) methods.delivery = true;
        if (item.marketplaceOptions.shipping) methods.shipping = true;
      } else {
        methods.pickup = true;
        methods.delivery = true;
        methods.shipping = true;
      }
    });

    return methods;
  };

  const availableDeliveryMethods = getAvailableDeliveryMethods();
  const sellerMethods = getSellerDeliveryMethods();
  const hasMultipleSellers = sellerMethods.size > 1;

  // Check if an item supports the selected delivery method
  const itemSupportsDeliveryMethod = (item: any) => {
    if (!item.marketplaceOptions) {
      // If no marketplace options, assume all methods are supported
      return true;
    }

    if (deliveryMethod === 'pickup' && item.marketplaceOptions.pickup) return true;
    if (deliveryMethod === 'delivery' && item.marketplaceOptions.delivery) return true;
    if (deliveryMethod === 'shipping' && item.marketplaceOptions.shipping) return true;

    return false;
  };

  // Get only items that support the selected delivery method
  const supportedItems = items.filter(itemSupportsDeliveryMethod);
  const unsupportedItems = items.filter((item) => !itemSupportsDeliveryMethod(item));
  const hasUnsupportedItems = unsupportedItems.length > 0;
  // Card queries and mutations
  const { data: cardsResponse, refetch: refetchCards } = useCardsQuery();
  const createCardMutation = useCreateCardMutation();
  const deleteCardMutation = useDeleteCardMutation();
  const toggleDefaultCardMutation = useSetDefaultCardMutation();

  // Get addresses array from response - handle both array and single object
  const addressesData = Array.isArray(addressesResponse?.data)
    ? addressesResponse.data
    : addressesResponse?.data
      ? [addressesResponse.data]
      : [];

  // Get cards array from response
  const cardsData = cardsResponse?.data || [];

  // Set default delivery method based on available options
  useEffect(() => {
    if (!deliveryMethod) {
      if (availableDeliveryMethods.pickup) {
        setDeliveryMethod('pickup');
      } else if (availableDeliveryMethods.delivery) {
        setDeliveryMethod('delivery');
      } else if (availableDeliveryMethods.shipping) {
        setDeliveryMethod('shipping');
      }
    }
  }, [availableDeliveryMethods, deliveryMethod]);

  // Set default selected address when addresses are loaded
  useEffect(() => {
    if (addressesData && addressesData.length > 0 && !selectedAddress) {
      // First try to find the default address
      const defaultAddress = addressesData.find((addr: any) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else {
        // If no default address, select the first one
        setSelectedAddress(addressesData[0]);
      }
    }
  }, [addressesData, selectedAddress]);

  // Set default selected card when cards are loaded
  useEffect(() => {
    if (cardsData && cardsData.length > 0 && !selectedCard) {
      // First try to find the default card
      const defaultCard = cardsData.find((card: any) => card.isDefault);
      if (defaultCard) {
        setSelectedCard(defaultCard);
      } else {
        // If no default card, select the first one
        setSelectedCard(cardsData[0]);
      }
    }
  }, [cardsData, selectedCard]);

  // Prevent navigation when payment is processing
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isProcessingPayment && currentLocation.pathname !== nextLocation.pathname
  );

  // Show confirmation dialog when navigation is blocked
  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmNavigation = window.confirm(
        'Payment is being processed. Are you sure you want to leave this page? Your payment may fail.'
      );

      if (confirmNavigation) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  // Prevent tab close/reload when payment is processing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessingPayment) {
        e.preventDefault();
        e.returnValue = 'Payment is being processed. Are you sure you want to leave?';
        return 'Payment is being processed. Are you sure you want to leave?';
      }
    };

    const handleUnload = () => {
      if (isProcessingPayment) {
        // Log or handle payment interruption
        console.warn('Payment processing was interrupted');
      }
    };

    // Prevent browser back button
    const handlePopState = (e: PopStateEvent) => {
      if (isProcessingPayment) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        alert('Payment is being processed. Please wait for it to complete.');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    window.addEventListener('popstate', handlePopState);

    // Push initial state to prevent immediate back navigation
    if (isProcessingPayment) {
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isProcessingPayment]);

  // Calculate totals
  // Calculate prices only for supported items
  const subtotal = supportedItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  const excludedSubtotal = unsupportedItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Calculate shipping fee properly
  const calculateShippingFee = () => {
    if (deliveryMethod !== 'shipping') return 0;

    // Group items by seller
    const sellerGroups = new Map<string, any[]>();

    supportedItems.forEach((item) => {
      const sellerId = item.seller?.id || 'default';
      if (!sellerGroups.has(sellerId)) {
        sellerGroups.set(sellerId, []);
      }
      sellerGroups.get(sellerId)!.push(item);
    });

    let totalShipping = 0;

    // Calculate shipping for each seller
    sellerGroups.forEach((sellerItems, sellerId) => {
      // Group items by base product (ignoring variants)
      const productGroups = new Map<string, any[]>();

      sellerItems.forEach((item) => {
        const baseProductId = item.productId || item.id;
        if (!productGroups.has(baseProductId)) {
          productGroups.set(baseProductId, []);
        }
        productGroups.get(baseProductId)!.push(item);
      });

      // For each seller, take the max shipping price among different products
      // For same product with multiple variants, charge shipping only once
      let sellerShipping = 0;

      productGroups.forEach((productItems) => {
        // For variants of the same product, take the shipping price once
        const productShipping = productItems[0].shippingPrice || 0;
        sellerShipping = Math.max(sellerShipping, productShipping);
      });

      totalShipping += sellerShipping;
    });

    return totalShipping;
  };

  // Calculate delivery/shipping fees
  let deliveryFee = 0;
  if (deliveryMethod === 'delivery') {
    deliveryFee = 39; // Base delivery fee + $1/mile (could be calculated based on distance)
  } else if (deliveryMethod === 'shipping') {
    deliveryFee = calculateShippingFee();
  }

  const tax = 0; // Tax calculation can be added based on location
  const discount = 0; // Discount can be applied if promo code is used
  const total = subtotal + deliveryFee + tax - discount;

  const handlePlaceOrder = async () => {
    // Validate delivery/shipping address if delivery or shipping method is selected
    if ((deliveryMethod === 'delivery' || deliveryMethod === 'shipping') && !selectedAddress) {
      toast.error(`Please select a ${deliveryMethod} address`);
      return;
    }

    // Validate payment card is selected
    if (!selectedCard) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Prepare checkout data - only include supported items
      const checkoutData = {
        items: supportedItems.map((item: any) => ({
          productId: item.productId || item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          color: item.color,
          seller: item.seller,
          shippingPrice: item.shippingPrice || 0, // Include shipping price for backend calculation
        })),
        deliveryMethod,
        deliveryAddress: selectedAddress
          ? {
              name: selectedAddress.name || selectedAddress.label || '',
              phone: selectedAddress.phoneNumber || selectedAddress.phone || '',
              street: selectedAddress.street || selectedAddress.location || '',
              city: selectedAddress.city || '',
              state: selectedAddress.state || '',
              zipCode: selectedAddress.zipCode || selectedAddress.zip || '',
              country: selectedAddress.country || 'USA',
            }
          : undefined,
        paymentCardId: selectedCard._id || selectedCard.id,
        totals: {
          subtotal,
          deliveryFee,
          tax,
          discount,
          total,
        },
        notes: '',
      };

      // Create payment intent
      const paymentIntent = await createPaymentIntent.mutateAsync(checkoutData);

      // For now, we'll simulate payment success
      // In production, you would integrate Stripe Elements here

      // Confirm the payment
      // Use first orderId from array (all orders linked by same paymentIntentId)
      await confirmPayment.mutateAsync({
        paymentIntentId: paymentIntent.paymentIntentId,
        orderId: paymentIntent.orderIds[0], // First order ID from the array
      });

      // Show success dialog
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAddNewAddress = async (data: any) => {
    try {
      await createAddressMutation.mutateAsync(data);
      await refetchAddresses();
      setShowAddAddressModal(false);
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const handleAddCard = async (data: any) => {
    try {
      if (editingCard) {
        // Handle edit if needed
      } else {
        await createCardMutation.mutateAsync(data);
      }
      await refetchCards();
      setShowCardModal(false);
      setEditingCard(null);
      toast.success('Card added successfully');
    } catch (error) {
      console.error('Failed to add card:', error);
      toast.error('Failed to add card');
    }
  };

  const handleDeleteCard = async (card: any) => {
    try {
      await deleteCardMutation.mutateAsync(card._id || card.id);
      await refetchCards();
      toast.success('Card deleted successfully');
    } catch (error) {
      console.error('Failed to delete card:', error);
      toast.error('Failed to delete card');
    }
  };

  const handleToggleDefault = async (id: string) => {
    try {
      await toggleDefaultCardMutation.mutateAsync(id);
      await refetchCards();
      toast.success('Default card updated');
    } catch (error) {
      console.error('Failed to update default card:', error);
      toast.error('Failed to update default card');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Please add items to your cart before checkout.</p>
        <Button
          onClick={() => navigate('/marketplace')}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Full-screen Payment Processing Overlay */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center space-y-6">
              {/* Animated Loader */}
              <div className="relative">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-primary/50" />
                </div>
              </div>

              {/* Processing Text */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Processing Payment</h3>
                <p className="text-gray-600">
                  Please wait while we securely process your payment...
                </p>
                <p className="text-sm text-gray-500 mt-4">Do not close or refresh this page</p>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L4 7V12C4 16.5 7 20.26 12 21C17 20.26 20 16.5 20 12V7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Secured by Stripe</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full animate-pulse"
                  style={{ width: '70%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Checkout Form */}

          <div className="sm:col-span-2 space-y-4">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900">
              {isBuyNow ? 'Buy Now Checkout' : 'Checkout'}
            </h1>

            {/* Delivery Method */}
            <Card className="p-4 gap-1">
              <div className="flex justify-between gap-2 items-center border-b border-gray-200 pb-2">
                <h2 className="text-xl font-semibold mb-2">
                  How would you like to get your Product?
                </h2>
              </div>

              {/* Multiple sellers notice with delivery limitations */}
              {hasMultipleSellers && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium mb-2">
                    Note: You have items from multiple sellers
                  </p>
                  <p className="text-sm text-amber-700">
                    When you select a delivery method, only items from sellers who support that
                    method will be included in the order. Items from other sellers will need to be
                    ordered separately.
                  </p>
                </div>
              )}

              <div className="mt-4">
                <RadioGroup
                  value={deliveryMethod}
                  onValueChange={(value) =>
                    setDeliveryMethod(value as 'pickup' | 'delivery' | 'shipping')
                  }
                >
                  <div className="space-y-3">
                    {/* Pickup Option */}
                    <div
                      className={cn(
                        'flex items-center space-x-3 rounded-lg',
                        availableDeliveryMethods.pickup ? 'hover:bg-gray-50' : 'opacity-50'
                      )}
                    >
                      <RadioGroupItem
                        value="pickup"
                        id="pickup"
                        disabled={!availableDeliveryMethods.pickup}
                      />
                      <Label
                        htmlFor="pickup"
                        className={cn(
                          'flex-1 flex items-center justify-between',
                          availableDeliveryMethods.pickup ? 'cursor-pointer' : 'cursor-not-allowed'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-gray-600" />
                          Pickup
                        </span>
                        <span
                          className={
                            availableDeliveryMethods.pickup
                              ? 'text-green-600 font-medium'
                              : 'text-gray-500'
                          }
                        >
                          {availableDeliveryMethods.pickup ? 'Free' : 'Not available'}
                        </span>
                      </Label>
                    </div>

                    {/* Delivery Option */}
                    <div
                      className={cn(
                        'flex items-center space-x-3 rounded-lg',
                        availableDeliveryMethods.delivery ? 'hover:bg-gray-50' : 'opacity-50'
                      )}
                    >
                      <RadioGroupItem
                        value="delivery"
                        id="delivery"
                        disabled={!availableDeliveryMethods.delivery}
                      />
                      <Label
                        htmlFor="delivery"
                        className={cn(
                          'flex-1 flex items-center justify-between',
                          availableDeliveryMethods.delivery
                            ? 'cursor-pointer'
                            : 'cursor-not-allowed'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-gray-600" />
                          Delivery
                        </span>
                        <span className="text-gray-600">
                          {availableDeliveryMethods.delivery ? '$39 + $1/mile' : 'Not available'}
                        </span>
                      </Label>
                    </div>

                    {/* Shipping Option */}
                    <div
                      className={cn(
                        'flex items-center space-x-3 rounded-lg',
                        availableDeliveryMethods.shipping ? 'hover:bg-gray-50' : 'opacity-50'
                      )}
                    >
                      <RadioGroupItem
                        value="shipping"
                        id="shipping"
                        disabled={!availableDeliveryMethods.shipping}
                      />
                      <Label
                        htmlFor="shipping"
                        className={cn(
                          'flex-1 flex items-center justify-between',
                          availableDeliveryMethods.shipping
                            ? 'cursor-pointer'
                            : 'cursor-not-allowed'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-gray-600" />
                          Shipping
                        </span>
                        <span className="text-gray-600">
                          {availableDeliveryMethods.shipping
                            ? (() => {
                                // Use the same shipping calculation logic
                                const sellerGroups = new Map<string, any[]>();

                                supportedItems.forEach((item) => {
                                  const sellerId = item.seller?.id || 'default';
                                  if (!sellerGroups.has(sellerId)) {
                                    sellerGroups.set(sellerId, []);
                                  }
                                  sellerGroups.get(sellerId)!.push(item);
                                });

                                let totalShipping = 0;

                                sellerGroups.forEach((sellerItems) => {
                                  const productGroups = new Map<string, any[]>();

                                  sellerItems.forEach((item) => {
                                    const baseProductId = item.productId || item.id;
                                    if (!productGroups.has(baseProductId)) {
                                      productGroups.set(baseProductId, []);
                                    }
                                    productGroups.get(baseProductId)!.push(item);
                                  });

                                  let sellerShipping = 0;
                                  productGroups.forEach((productItems) => {
                                    const productShipping = productItems[0].shippingPrice || 0;
                                    sellerShipping = Math.max(sellerShipping, productShipping);
                                  });

                                  totalShipping += sellerShipping;
                                });

                                return totalShipping > 0 ? formatCurrency(totalShipping) : 'Free';
                              })()
                            : 'Not available'}
                        </span>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </Card>

            {/* User Information - Show only for delivery and shipping */}
            {(deliveryMethod === 'delivery' || deliveryMethod === 'shipping') && (
              <Card
                className={cn(
                  'p-4 min-h-40',
                  (deliveryMethod === 'delivery' || deliveryMethod === 'shipping') &&
                    !selectedAddress &&
                    'border-red-200'
                )}
              >
                <div className="flex justify-between gap-2 items-center border-b border-gray-200 pb-4">
                  <h3 className="flex gap-2 items-center font-semibold text-gray-900">
                    {' '}
                    <MapPin /> {deliveryMethod === 'delivery' ? 'Delivery' : 'Shipping'} Address
                  </h3>

                  {/* Add New Address Button */}
                  <Button
                    type="button"
                    onClick={() => setShowAddAddressModal(true)}
                    variant="outline"
                    className=" flex items-center justify-center gap-2 text-sm h-10 border border-primary text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Address
                  </Button>
                </div>
                {addressesData && addressesData.length > 0 ? (
                  <>
                    {/* Address list with show more/less functionality */}
                    <RadioGroup
                      value={selectedAddress?.id || selectedAddress?._id || ''}
                      onValueChange={(value) => {
                        const address = addressesData.find((a: any) => (a.id || a._id) === value);
                        if (address) setSelectedAddress(address);
                      }}
                    >
                      <div
                        className={cn(
                          'space-y-3 transition-all duration-300',
                          !showAllAddresses &&
                            addressesData.length > 3 &&
                            'max-h-[300px] overflow-hidden'
                        )}
                      >
                        {(showAllAddresses ? addressesData : addressesData.slice(0, 3)).map(
                          (address: any) => (
                            <div
                              key={address.id || address._id}
                              className={cn(
                                'flex items-start gap-3 p-3 rounded-lg cursor-pointer relative border',
                                selectedAddress?.id === address.id ||
                                  selectedAddress?._id === address._id
                                  ? 'bg-blue-50 border-primary'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              )}
                              onClick={() => setSelectedAddress(address)}
                            >
                              <RadioGroupItem
                                value={address.id || address._id}
                                id={address.id || address._id}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">
                                    {address.name || address.label || 'Address'}
                                  </h4>
                                  {address.isDefault && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-primary bg-blue-100 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {address.formattedAddress ||
                                    address.fullAddress ||
                                    `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}`}
                                </p>
                                {(address.phoneNumber || address.phone) && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Phone: {address.phoneNumber || address.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </RadioGroup>

                    {/* Show More/Less button */}
                    {addressesData.length > 3 && (
                      <button
                        onClick={() => setShowAllAddresses(!showAllAddresses)}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium mx-auto mt-4"
                      >
                        {showAllAddresses ? (
                          <>
                            Show Less
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Show More ({addressesData.length - 3} more)
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 flex justify-center items-center min-h-40">
                    <p className="text-sm text-gray-500 italic">
                      Save your addresses for quick access during checkout
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Delivery Time */}
            <Card className="p-4">
              <div className="flex justify-between gap-2 items-center border-b border-gray-200 pb-4">
                <h3 className="flex gap-2 items-center font-semibold text-gray-900">
                  <Clock3 /> Expected Delivery Time
                </h3>
              </div>
              <div className="bg-gray-50 rounded-lg">
                <p className="text-gray-700">12-02-2025 to 20-02-2025</p>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className={cn('p-4 min-h-40', !selectedCard && 'border-red-200')}>
              <div className="flex justify-between gap-2 items-center border-b border-gray-200 pb-4">
                <h3 className="flex gap-2 items-center font-semibold text-gray-900">
                  {' '}
                  <CreditCard /> Payment Method
                </h3>

                {/* Add New Card Button */}
                <Button
                  type="button"
                  onClick={() => setShowCardModal(true)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 text-sm h-10 border border-primary text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4" />
                  Add New Card
                </Button>
              </div>

              {cardsData && cardsData.length > 0 ? (
                <>
                  {/* Cards list with radio selection */}
                  <RadioGroup
                    value={selectedCard?.id || selectedCard?._id || ''}
                    onValueChange={(value) => {
                      const card = cardsData.find((c: any) => (c.id || c._id) === value);
                      if (card) setSelectedCard(card);
                    }}
                  >
                    <div
                      className={cn(
                        'space-y-3 transition-all duration-300',
                        showAllCards && cardsData.length > 3 && 'max-h-[400px] overflow-y-auto pr-2'
                      )}
                    >
                      {(showAllCards ? cardsData : cardsData.slice(0, 3)).map((card: any) => (
                        <div
                          key={card.id || card._id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg cursor-pointer relative border',
                            selectedCard &&
                              ((selectedCard.id && selectedCard.id === card.id) ||
                                (selectedCard._id && selectedCard._id === card._id))
                              ? 'bg-blue-50 border-primary'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          )}
                          onClick={() => setSelectedCard(card)}
                        >
                          <RadioGroupItem
                            value={card.id || card._id}
                            id={card.id || card._id}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <SavedCardNormal
                              id={card._id || card.id}
                              accountHolder={card.cardholderName || card.name || 'Card Holder'}
                              accountNumber={`**** **** **** ${card.last4 || card.last4Digits || '****'}`}
                              bankName={card.brand || card.cardBrand || 'Card'}
                              expiryDate={
                                card.expiryMonth && card.expiryYear
                                  ? `${card.expiryMonth}/${card.expiryYear}`
                                  : undefined
                              }
                              onDelete={() => handleDeleteCard(card)}
                              onToggleDefault={async (id, isDefault) => {
                                if (isDefault) {
                                  await handleToggleDefault(id);
                                }
                              }}
                              isDefault={card.isDefault}
                              totalCards={cardsData.length > 0}
                              isCard={true}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  {/* Show More/Less button */}
                  {cardsData.length > 3 && (
                    <button
                      onClick={() => setShowAllCards(!showAllCards)}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium mx-auto mt-4"
                    >
                      {showAllCards ? (
                        <>
                          Show Less
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Show More ({cardsData.length - 3} more)
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-4 flex justify-center items-center min-h-40">
                  <p className="text-sm text-gray-500 italic">
                    Save your payment cards for quick and secure checkout
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Order Details */}
          <div className="sm:col-span-2">
            <Card className="p-4 sticky top-4 gap-1">
              <h2 className="text-xl font-semibold mb-2 border-b border-gray-200 pb-2">
                Order Details
              </h2>

              {/* Order Items */}
              <div className="space-y-4  max-h-[400px] overflow-y-auto">
                {items.map((item) => {
                  const isSupported = itemSupportsDeliveryMethod(item);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex gap-4 pb-4 border-b border-gray-200 last:border-0 relative',
                        !isSupported && 'opacity-50'
                      )}
                    >
                      {!isSupported && (
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-red-400 rounded-r"></div>
                      )}
                      <div className="flex-shrink-0">
                        <LazyImage
                          src={item.image}
                          alt={item.title}
                          className="rounded-lg"
                          wrapperClassName="w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
                          fallbackSrc="https://placehold.co/80x80"
                          objectFit="cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            'font-medium line-clamp-2',
                            isSupported ? 'text-gray-900' : 'text-gray-500'
                          )}
                        >
                          {item.title}
                        </h3>
                        {!isSupported && (
                          <p className="text-xs text-red-600 mt-1">
                            Not available for {deliveryMethod}
                          </p>
                        )}
                        {item.color && (
                          <p className="text-sm text-gray-500 mt-1">
                            Color: <span className="capitalize">{getColorName(item.color).name}</span>
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {/* Show original price with strikethrough if there's a discount */}
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-sm line-through text-gray-400">
                              {formatCurrency(item.originalPrice * item.quantity)}
                            </span>
                          )}
                          <p
                            className={cn(
                              'font-semibold',
                              isSupported ? 'text-primary' : 'text-gray-400 line-through'
                            )}
                          >
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          {/* Show discount badge */}
                          {item.discount &&
                            item.discount.discountType !== 'none' &&
                            item.discount.discountValue &&
                            isSupported && (
                              <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                {item.discount.discountType === 'percentage'
                                  ? `${item.discount.discountValue}% OFF`
                                  : `$${item.discount.discountValue} OFF`}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Excluded Items Warning */}
              {/* {hasUnsupportedItems && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  {unsupportedItems.length} {unsupportedItems.length === 1 ? 'item' : 'items'} not included
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  These items don't support {deliveryMethod} and will remain in your cart
                </p>
                {excludedSubtotal > 0 && (
                  <p className="text-xs text-amber-700 mt-1">
                    Excluded amount: {formatCurrency(excludedSubtotal)}
                  </p>
                )}
              </div>
            )} */}

              {/* Price Summary */}
              <div className="space-y-3 mt-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div>
                    <div className="flex justify-between text-gray-600">
                      <span>
                        {deliveryMethod === 'delivery'
                          ? 'Delivery'
                          : deliveryMethod === 'shipping'
                            ? 'Shipping'
                            : 'Service Fee'}
                      </span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                    {/* Show shipping breakdown if shipping is selected */}
                    {deliveryMethod === 'shipping' && deliveryFee > 0 && (
                      <div className="mt-1 text-xs text-gray-500 italic">
                        Combined shipping from{' '}
                        {new Set(supportedItems.map((item) => item.seller?.id || 'default')).size}{' '}
                        seller(s)
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="flex flex-col justify-end items-end ">
                <div>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessingPayment || supportedItems.length === 0}
                    className="w-[224px] mt-6 bg-primary hover:bg-primary/80 text-white font-semibold py-3 text-base disabled:opacity-50"
                  >
                    {isProcessingPayment
                      ? 'Processing...'
                      : supportedItems.length === 0
                        ? 'No items available'
                        : hasUnsupportedItems
                          ? `Place Order (${supportedItems.length} ${supportedItems.length === 1 ? 'item' : 'items'})`
                          : 'Place Order'}
                  </Button>
                  {/* Security Note */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">🔒 Secure checkout powered by Stripe</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Add Address Modal */}
        <AddSavedAddressModal
          isOpen={showAddAddressModal}
          onClose={() => setShowAddAddressModal(false)}
          onSubmit={handleAddNewAddress}
          isSubmitting={createAddressMutation.isPending}
          totalAddress={addressesData.length > 0}
        />

        {/* Add Card Modal */}
        <AddCardModalStripe
          isOpen={showCardModal}
          onClose={() => {
            setShowCardModal(false);
            setEditingCard(null);
          }}
          onSubmit={handleAddCard}
          isSubmitting={createCardMutation.isPending}
          totalCards={cardsData.length > 0}
          isEdit={!!editingCard}
          initialData={editingCard}
        />

        {/* Order Success Dialog */}
        <OrderSuccessDialog
          isOpen={showSuccessDialog}
          onClose={() => {
            setShowSuccessDialog(false);
            // Only clear cart if this was a regular cart checkout (not Buy Now)
            if (!isBuyNow) {
              clearCart();
            }
            navigate('/buying');
            // Don't navigate immediately - let the success dialog handle navigation
          }}
        />
      </div>
    </>
  );
};

export default CheckoutPage;
