import React, { useState, useCallback, useMemo } from 'react';
import { OrdersDataTable } from '@/features/dashboard/components/OrdersDataTable';
import { useNavigate } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui';
import { useOrdersQuery } from '../hooks/useOrderMutations';
import { SellerOrdersPageSkeleton } from '../components/SellerOrdersPageSkeleton';
import { SortDropdown, OrderFilterDropdown, FilterConfig } from '../components';
import { SearchInput } from '@/features/admin/user-management/components/SearchInput';
import { transformOrders } from '../utils/orderTransformers';
import { EmptyState } from '@/components/common/EmptyState';
import OrderEmptyIcon from '@/assets/svg/orderEmptyState.svg';

const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedSort, setSelectedSort] = useState<string>('recent');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [searchValue, setSearchValue] = useState('');
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
      ...(searchValue && { search: searchValue }),
    };
  }, [
    currentPage,
    itemsPerPage,
    selectedSort,
    filters,
    customDateRange,
    searchValue,
    getSortParams,
  ]);

  // Fetch orders from API with filters
  const { data, isLoading, isError, error } = useOrdersQuery(queryParams);

  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
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

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value !== searchValue) {
      setCurrentPage(1); // Reset to first page when search changes
    }
  };

  // Show full page skeleton only on initial load (no filters/sort/search)
  if (
    isLoading &&
    !searchValue &&
    !filters.orderStatus &&
    !filters.pricing &&
    selectedSort === 'recent' &&
    currentPage === 1
  ) {
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
  const orders: any = data?.data || [];
  const transformedOrders = transformOrders(orders);

  const totalPages = data?.meta?.pagination?.totalPages || 1;
  // Empty state handling moved to main render

  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Header with Search, Sort and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <SearchInput
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search by order no, buyer, seller, driver..."
            className="w-64"
          />
          <SortDropdown selectedSort={selectedSort} onSortChange={handleSortChange} />
          <OrderFilterDropdown filters={filters} onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Loading State for filtered results */}
      {isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table header skeleton */}
          <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-200">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-18 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          {/* Table rows skeleton */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-8 w-16 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !transformedOrders.length && (
        <EmptyState
          title="No orders found"
          description={
            searchValue
              ? `No orders found for "${searchValue}". Try a different search term.`
              : filters.orderStatus || filters.pricing || selectedSort !== 'recent'
                ? 'No orders match your current filters. Try adjusting your filters.'
                : "You don't have any orders yet."
          }
          icon={<img src={OrderEmptyIcon} className="w-64 h-56" alt="No orders" />}
          className="min-h-[400px]"
        />
      )}

      {/* Orders Table */}
      {!isLoading && transformedOrders.length > 0 && (
        <OrdersDataTable
          orders={transformedOrders as any}
          onViewDetails={handleViewOrderDetails}
          showSort={false}
          showFilter={false}
        />
      )}

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

export default AdminOrdersPage;
