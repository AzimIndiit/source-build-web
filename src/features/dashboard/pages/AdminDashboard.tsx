import React, { useState, useCallback, useMemo } from 'react';

// Import modular components
import { MetricsGrid } from '../components/MetricsGrid';
import { WeeklySalesChart } from '../components/charts/WeeklySalesChart';
import { RevenueChart } from '../components/charts/RevenueChart';
import { OrdersTable } from '../components/OrdersTable';
import { OrdersTableSkeleton } from '../components/OrdersTableSkeleton';

// Import data and types
import { weekSalesData, revenueData, metricsAdminData } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { transformOrders } from '@/features/orders/utils/orderTransformers';
import { useProductsQuery } from '@/features/products/hooks/useProductMutations';
import { useOrdersQuery } from '@/features/orders/hooks/useOrderMutations';

export const AdminDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedSort, setSelectedSort] = useState<string>('recent');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [filters, setFilters] = useState<any>({
    orderStatus: '',
    pricing: '',
  });
  const navigate = useNavigate();

  // Convert sort option to API parameters - matching DriverOrdersPage logic
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

  // Build query parameters - only send page and limit by default
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
  const { data, isLoading, isError, error } = useOrdersQuery(queryParams);
  const orders = data?.data || [];
  // Transform API orders to match dashboard Order type
  const transformedOrders = transformOrders(orders);

  const handleViewAllOrders = () => {
    navigate('/admin/orders');
  };

  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleSortChange = (value: string, dateRange?: { from: Date; to: Date }) => {
    setSelectedSort(value);
    setCustomDateRange(dateRange);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid metrics={metricsAdminData} />

      {/* Charts Row - Stack on mobile, side-by-side on tablet and up */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="min-h-[350px] lg:min-h-[400px]">
          <WeeklySalesChart title="This Week Earnings" data={weekSalesData} />
        </div>
        <div className="min-h-[350px] lg:min-h-[400px]">
          <RevenueChart
            title="Total Earnings"
            data={revenueData}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <OrdersTableSkeleton />
      ) : isError ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <p className="text-red-600 font-semibold mb-2">Error loading orders</p>
            <p className="text-gray-600 text-sm">
              {(error as any)?.response?.data?.message ||
                'Failed to fetch orders. Please try again.'}
            </p>
          </div>
        </div>
      ) : (
        <OrdersTable
          title="Recent Orders"
          orders={transformedOrders as any}
          showSort={false}
          showFilter={true}
          selectedSort={selectedSort}
          onSortChange={handleSortChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onViewAll={handleViewAllOrders}
          onViewDetails={handleViewOrderDetails}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
