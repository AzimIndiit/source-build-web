import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui';
import { QuotesDataTable } from '../components/QuotesDataTable';
import { useDeleteQuote, useQuotesQuery } from '../hooks/useQuoteMutations';
import { Quote } from '../types';
import { useGetOrCreateChatMutation } from '@/features/messages/hooks/useChatQueries';
import { QuotesPageSkeleton } from '../components/QuotesPageSkeleton';

const QuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');

  // Fetch quotes from API
  const { data, isLoading } = useQuotesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchValue,
  });
  const { mutate: getOrCreateChat, isPending } = useGetOrCreateChatMutation();
  // Delete quote mutation
  const deleteQuoteMutation = useDeleteQuote();

  const handleViewQuote = (quote: Quote) => {
    navigate(`/admin/quote/${quote.id || quote._id}`);
  };

  const handleReplyQuote = (quote: Quote) => {
    if(quote.user?.id) {
    getOrCreateChat({ participantId: quote.user?.id });
    }
   
  };

  const handleDeleteQuote = (id: string) => {
    deleteQuoteMutation.mutate(id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value !== searchValue) {
      setCurrentPage(1); // Reset to first page when search changes
    }
  };

  // Transform the data to match the expected format
  const quotes = data?.data?.quotes || [];
  const totalPages = data?.pagination?.pages || 1;

  // Show full page skeleton only on initial load (no search/filter)
  if (isLoading && !searchValue && currentPage === 1) {
    return <QuotesPageSkeleton />;
  }

  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Quotes Data Table */}
      <QuotesDataTable
        quotes={quotes}
        onView={handleViewQuote}
        onReply={handleReplyQuote}
        onDelete={handleDeleteQuote}
        title="Quotes"
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
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

export default QuotePage;