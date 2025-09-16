import React, { useState, useCallback, useMemo } from 'react';
import { OrdersTable } from '@/features/dashboard/components/OrdersTable';
import { useNavigate } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui';
import { useSellerOrdersQuery } from '../hooks/useOrderMutations';
import { SellerOrdersPageSkeleton } from '../components/SellerOrdersPageSkeleton';
import { SortDropdown, OrderFilterDropdown, FilterConfig } from '../components';
import { transformOrders } from '../utils/orderTransformers';

const SellerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedSort, setSelectedSort] = useState<string>('recent');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [filters, setFilters] = useState<FilterConfig>({
    orderStatus: '',
    pricing: '',
  });

  // Convert sort option to API parameters
  const getSortParams = useCallback(
    (sortValue: string, pricingFilter?: string, dateRange?: { from: Date; to: Date }) => {
      const now = new Date();
      let startDate: string | undefined;
      let endDate: string | undefined;
      let sort = '-createdAt'; // Default to recent (descending)

      // Handle pricing sort if provided
      if (pricingFilter) {
        switch (pricingFilter) {
          case 'high-to-low':
            sort = '-amount';
            break;
          case 'low-to-high':
            sort = 'amount';
            break;
        }
      } else {
        // Handle date-based sorting
        switch (sortValue) {
          case 'custom':
            if (dateRange) {
              // Format dates in local timezone to avoid UTC conversion issues
              const fromYear = dateRange.from.getFullYear();
              const fromMonth = String(dateRange.from.getMonth() + 1).padStart(2, '0');
              const fromDay = String(dateRange.from.getDate()).padStart(2, '0');
              startDate = `${fromYear}-${fromMonth}-${fromDay}`;

              const toYear = dateRange.to.getFullYear();
              const toMonth = String(dateRange.to.getMonth() + 1).padStart(2, '0');
              const toDay = String(dateRange.to.getDate()).padStart(2, '0');
              endDate = `${toYear}-${toMonth}-${toDay}`;
            }
            break;
          case 'this-week':
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);
            startDate = weekStart.toISOString().split('T')[0]; // Get only date part
            break;
          case 'this-month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            monthStart.setHours(0, 0, 0, 0);
            startDate = monthStart.toISOString().split('T')[0]; // Get only date part
            break;
          case 'last-3-months':
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            threeMonthsAgo.setHours(0, 0, 0, 0);
            startDate = threeMonthsAgo.toISOString().split('T')[0]; // Get only date part
            break;
          case 'last-6-months':
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            sixMonthsAgo.setHours(0, 0, 0, 0);
            startDate = sixMonthsAgo.toISOString().split('T')[0]; // Get only date part
            break;
          case 'recent':
          default:
            // Just use default sort
            break;
        }
      }

      return { startDate, endDate, sort };
    },
    []
  );

  // Build query parameters
  const queryParams = useMemo(() => {
    const { startDate, endDate, sort } = getSortParams(
      selectedSort,
      filters.pricing,
      customDateRange
    );

    return {
      page: currentPage,
      limit: itemsPerPage,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(sort && { sort }),
      ...(filters.orderStatus && { status: filters.orderStatus }),
    };
  }, [currentPage, itemsPerPage, selectedSort, filters, customDateRange, getSortParams]);

  // Fetch orders from API with filters
  const { data, isLoading, isError, error } = useSellerOrdersQuery(queryParams);

  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/seller/orders/${orderId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (value: string, dateRange?: { from: Date; to: Date }) => {
    setSelectedSort(value);
    setCustomDateRange(dateRange);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleFilterChange = (newFilters: FilterConfig) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Loading state
  if (isLoading) {
    return <SellerOrdersPageSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold mb-2">Error loading orders</p>
        <p className="text-gray-600 text-sm">
          {(error as any)?.response?.data?.message || 'Failed to fetch orders. Please try again.'}
        </p>
      </div>
    );
  }

  // Transform data to match the expected format for OrdersTable
  const orders = data?.data || [];
  const transformedOrders = transformOrders(orders);

  const totalPages = data?.pagination?.totalPages || 1;

  // No orders state
  if (!transformedOrders.length) {
    return (
      <div className="py-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Orders</h1>
          <div className="flex items-center gap-2 md:gap-4">
            <SortDropdown selectedSort={selectedSort} onSortChange={handleSortChange} />
            <OrderFilterDropdown filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <p className="text-gray-600 font-semibold mb-2">No orders found</p>
          <p className="text-gray-500 text-sm">You don't have any orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Header with Sort and Filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <SortDropdown selectedSort={selectedSort} onSortChange={handleSortChange} />
          <OrderFilterDropdown filters={filters} onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable
        orders={transformedOrders}
        onViewDetails={handleViewOrderDetails}
        showSort={false}
        showFilter={false}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SellerOrdersPage;
