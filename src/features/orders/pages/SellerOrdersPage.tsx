import React, { useState } from 'react';
import { OrdersTable } from '@/features/dashboard/components/OrdersTable';
import { ordersData } from '@/features/dashboard/data/mockData';
import { useNavigate } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui';

const SellerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // For now, use all orders without filtering
  const filteredOrders = ordersData;

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/seller/orders/${orderId}`);
  };



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="py-4 md:p-6 space-y-6">
 
      {/* Orders Table */}
        <OrdersTable
          title='Orders'
         
          orders={paginatedOrders}
          onViewDetails={handleViewOrderDetails}
        />
  {/* Pagination */}
  <PaginationWrapper currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default SellerOrdersPage;
