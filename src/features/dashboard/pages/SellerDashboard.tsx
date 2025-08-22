import React, { useState } from 'react';

// Import modular components
import { MetricsGrid } from '../components/MetricsGrid';
import { WeeklySalesChart } from '../components/charts/WeeklySalesChart';
import { RevenueChart } from '../components/charts/RevenueChart';
import { OrdersTable } from '../components/OrdersTable';

// Import data and types
import { metricsData, weekSalesData, revenueData, ordersData } from '../data/mockData';

export const SellerDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2024');

  const handleViewAllOrders = () => {
    // Navigate to orders page or show all orders
    console.log('Navigate to all orders');
  };

  const handleViewOrderDetails = (orderId: string) => {
    // Navigate to order details page
    console.log('View order details:', orderId);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      {/* Metrics Grid */}
      <MetricsGrid metrics={metricsData} />
      
      {/* Charts Row - Stack on mobile, side-by-side on tablet and up */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="min-h-[350px] lg:min-h-[400px]">
          <WeeklySalesChart data={weekSalesData} />
        </div>
        <div className="min-h-[350px] lg:min-h-[400px]">
          <RevenueChart 
            data={revenueData}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>
      
      {/* Orders Table */}
      <OrdersTable 
        orders={ordersData}
        onViewAll={handleViewAllOrders}
        onViewDetails={handleViewOrderDetails}
      />
    </div>
  );
};

export default SellerDashboard;