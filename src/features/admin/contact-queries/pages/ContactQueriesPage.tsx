import React, { useState } from 'react';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { useContactQueriesQuery } from '../hooks/useContactQueriesMutations';
import { ContactQueriesDataTable } from '../components/ContactQueriesDataTable';

const ContactQueriesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const itemsPerPage = 10;

  // Fetch contact queries from API
  const { data, isLoading } = useContactQueriesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchValue,
    status: statusFilter,
  });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle the API response structure
  const queries = data?.data?.contacts || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      {/* Contact Queries Table */}
      <ContactQueriesDataTable
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        showSearch={true}
        queries={queries}
        title="Contact Queries"
        isLoading={isLoading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ContactQueriesPage;