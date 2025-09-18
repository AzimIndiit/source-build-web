import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui';
import {
  useUsersQuery,
  useBlockUser,
  useUnblockUser,
  useDeleteUser,
} from '../hooks/useUserMutations';

import { UserDataTable } from '../components/UserDataTable';
import { MetricsGrid } from '@/features/dashboard/components';
import { Users } from 'lucide-react';
import { BuyersPageSkeleton } from '../components/BuyersPageSkeleton';

const getMetricsUserData: any[] = [
  { 
    id: 'total',
    title: 'Total Buyers',
    value: '0',
    color: 'bg-[#269210]',
    icon: Users,
    bgColor: 'bg-white/20',
  },
  {
    id: 'pending',
    title: 'Pending Buyers',
    value: '0',
    color: 'bg-[#e68814]',
    icon: Users,
    bgColor: 'bg-white/20',
  },
  {
    id: 'active',
    title: 'Active Buyers',
    value: '0',
    color: 'bg-[#2b5aac]',
    icon: Users,
    bgColor: 'bg-white/20',
  },
  {
    id: 'inactive',
    title: 'Inactive Buyers',
    value: '0',
    color: 'bg-gray-500',
    icon: Users,
    bgColor: 'bg-white/20',
  },
  // {
  //   id: 'deleted',
  //   title: 'Deleted Buyers',
  //   value: '0',
  //   color: 'bg-[#da1010]',
  //   icon: Users,
  //   bgColor: 'bg-white/20',
  // },
];

const BuyerPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('recent');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [metricsUserData, setMetricsUserData] = useState<any[]>(getMetricsUserData);

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      role: 'buyer',
    };

    // Add search parameter if there's a search value
    if (searchValue) {
      params.search = searchValue;
    }

    // Add status filter if selected
    if (filterStatus) {
      params.status = filterStatus.toLowerCase();
    }

    // Add date range for custom sort
    if (sortValue === 'custom' && dateRange.from && dateRange.to) {
      // Set time to start of day for from date and end of day for to date
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      params.startDate = fromDate.toISOString();
      params.endDate = toDate.toISOString();
    } else if (sortValue !== 'recent') {
      // Handle other sort options
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      
      let startDate = new Date();
      
      switch(sortValue) {
        case 'this-week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'this-month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'last-3-months':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'last-6-months':
          startDate.setMonth(now.getMonth() - 6);
          break;
      }
      
      startDate.setHours(0, 0, 0, 0);
      
      if (sortValue !== 'recent') {
        params.startDate = startDate.toISOString();
        params.endDate = now.toISOString();
      }
    }

    return params;
  }, [currentPage, itemsPerPage, searchValue, filterStatus, sortValue, dateRange]);

  // Fetch users from API with filters
  const { data, isLoading, isError, error } = useUsersQuery(queryParams);

  // User action mutations
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();
  const deleteUserMutation = useDeleteUser();

  const handleViewUserDetails = (userId: string) => {
    navigate(`/view-buyer/${userId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSortChange = (value: string, range?: { from: Date; to: Date }) => {
    setSortValue(value);
    if (range) {
      setDateRange(range);
    }
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handleFilterChange = (filters: { status?: string }) => {
    setFilterStatus(filters.status || '');
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleBlockUser = (userId: string) => {
      blockUserMutation.mutate(userId);
  };

  const handleUnblockUser = (userId: string) => {
      unblockUserMutation.mutate(userId);
  };

  const handleDeleteUser = (userId: string) => {
   
      deleteUserMutation.mutate(userId);
  };

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold mb-2">Error loading users</p>
        <p className="text-gray-600 text-sm">
          {(error as any)?.response?.data?.message || 'Failed to fetch users. Please try again.'}
        </p>
      </div>
    );
  }

  // Transform data to match the expected format for UsersTable
  const transformedUsers = data?.users || [];
  const stats :any = data?.stats;

  useEffect(() => {
    if (stats) {
      setMetricsUserData(prevMetrics => 
        prevMetrics.map((metric: any) => {
          // Use new value if available, otherwise keep previous value
          const newValue = stats[metric.id];
          const value = newValue !== undefined ? newValue.toString() : metric.value;
          return {
            ...metric,
            value: value,
          };
        })
      );
    }
  }, [stats]);

  const totalPages = data?.pagination?.totalPages || 1;

  // Show full page skeleton only on initial load (no search/filter/sort)
  if (isLoading && !searchValue && !filterStatus && sortValue === 'recent' && currentPage === 1) {
    return <BuyersPageSkeleton />;
  }

  return (
    <div className="py-4 md:p-6 space-y-6">
      <MetricsGrid metrics={metricsUserData}  />
      {/* Buyers List */}
      <UserDataTable
        users={transformedUsers}
        onViewDetails={handleViewUserDetails}
        onBlock={handleBlockUser}
        onUnblock={handleUnblockUser}
        onDelete={handleDeleteUser}
        title="Buyers"
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        selectedSort={sortValue}
        onSortChange={handleSortChange}
        filters={{ status: filterStatus }}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
        actionLoading={blockUserMutation.isPending || unblockUserMutation.isPending || deleteUserMutation.isPending}
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

export default BuyerPage;
