import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronRight, 
  Eye, 
  Ban, 
  UserCheck, 
  Trash2, 
  MoreVertical,
  Mail,
  Calendar,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getStatusBadgeColor } from '@/features/dashboard/utils/orderUtils';
import { SortDropdown } from '@/components/common/SortDropdown';
import { getInitials } from '@/lib/helpers';
import { formatDate } from '@/lib/date-utils';
import { FormattedUserResponse } from '../hooks/useUserMutations';
import { FilterConfig, UserFilterDropdown } from './UserFilterDropdown';
import { SearchInput } from './SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import BuyingEmptyIcon from '@/assets/svg/buyingEmptyState.svg';
import { UserTableSkeleton } from './UserTableSkeleton';

interface UserTableProps {
  users: FormattedUserResponse[];
  onViewDetails?: (userId: string) => void;
  onEdit?: (userId: string) => void;
  onDelete?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onUnblock?: (userId: string) => void;
  title?: string;
  showFilter?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  selectedSort?: string;
  onSortChange?: (value: string) => void;
  filters?: FilterConfig;
  onFilterChange?: (newFilters: FilterConfig) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onViewDetails,
  onDelete,
  onBlock,
  onUnblock,
  title,
  showFilter = true,
  showSort = true,
  showSearch = true,
  selectedSort: propSelectedSort,
  onSortChange: propOnSortChange,
  filters: propFilters,
  onFilterChange: propOnFilterChange,
  searchValue: propSearchValue,
  onSearchChange: propOnSearchChange,
  isLoading = false,
}) => {
  // Use props if provided, otherwise use local state
  const [localSelectedSort, setLocalSelectedSort] = useState<string>('this-week');
  const [localFilters, setLocalFilters] = useState<FilterConfig>({
    status: '',
  });
  const [localSearchValue, setLocalSearchValue] = useState<string>('');

  const selectedSort = propSelectedSort !== undefined ? propSelectedSort : localSelectedSort;
  const filters = propFilters !== undefined ? propFilters : localFilters;
  const searchValue = propSearchValue !== undefined ? propSearchValue : localSearchValue;

  const handleSortChange = (value: string) => {
    if (propOnSortChange) {
      propOnSortChange(value);
    } else {
      setLocalSelectedSort(value);
    }
  };

  const handleFilterChange = (newFilters: FilterConfig) => {
    if (propOnFilterChange) {
      propOnFilterChange(newFilters);
    } else {
      setLocalFilters(newFilters);
    }
  };

  const handleSearchChange = (value: string) => {
    if (propOnSearchChange) {
      propOnSearchChange(value);
    } else {
      setLocalSearchValue(value);
    }
  };

  return (
    <div className="w-full">
      {/* Header with title and filters - Always visible */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {showSearch && (
            <SearchInput
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search users..."
              className="w-64"
            />
          )}
          {showSort && <SortDropdown selectedSort={selectedSort} onSortChange={handleSortChange} />}
          {showFilter && (
            <UserFilterDropdown filters={filters} onFilterChange={handleFilterChange} />
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <UserTableSkeleton />}

      {/* Empty State */}
      {!isLoading && users.length === 0 && (
        <EmptyState
          title={`No ${title || 'Users'} found`}
          description={searchValue 
            ? `No results found for "${searchValue}". Try adjusting your search.`
            : `You don't have any ${title?.toLowerCase() || 'users'} yet.`}
          icon={<img src={BuyingEmptyIcon} className="w-64 h-56" alt="No users" />}
          className="min-h-[400px]"
        />
      )}

      {/* Content - Only show if not loading and has users */}
      {!isLoading && users.length > 0 && (
        <>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-3">
            {users.map((user, index) => (
              <Card key={user.id || index} className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-4">
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                        {user.avatar ? (
                          <AvatarImage
                            src={user.avatar}
                            alt={user.displayName || 'User'}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-medium uppercase">
                          {getInitials(user.displayName || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.displayName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">#{index + 1}</p>
                      </div>
                    </div>
                    <Badge
                      className={`px-2 py-1 rounded-full font-medium text-xs capitalize ${getStatusBadgeColor(user.status)}`}
                    >
                      {user.status}
                    </Badge>
                  </div>

                  {/* User Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{user.email || 'No email'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">Login: {user.authType || 'Email'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">Joined: {formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary font-semibold text-xs"
                      onClick={() => onViewDetails?.(user.id || '')}
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === 'active' ? (
                          <DropdownMenuItem
                            onClick={() => onBlock?.(user.id || '')}
                            className="cursor-pointer text-orange-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Block User
                          </DropdownMenuItem>
                        ) : user.status === 'inactive' ? (
                          <DropdownMenuItem
                            onClick={() => onUnblock?.(user.id || '')}
                            className="cursor-pointer text-green-600"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Unblock User
                          </DropdownMenuItem>
                        ) : null}
                        {user.status !== 'deleted' && (
                          <DropdownMenuItem
                            onClick={() => onDelete?.(user.id || '')}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View - Table */}
          <Card className="hidden md:block bg-white shadow-sm border-gray-50 rounded-3xl p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm">
                      Sr.No.
                    </TableHead>
                    <TableHead className="text-left font-semibold text-gray-700 text-xs lg:text-sm">
                      Name
                    </TableHead>
                    <TableHead className="text-left font-semibold text-gray-700 text-xs lg:text-sm hidden lg:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="text-left font-semibold text-gray-700 text-xs lg:text-sm">
                      Login Type
                    </TableHead>
                    <TableHead className="text-left font-semibold text-gray-700 text-xs lg:text-sm">
                      Created On
                    </TableHead>
                    <TableHead className="text-left font-semibold text-gray-700 text-xs lg:text-sm">
                      Status
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.id || index} className="hover:bg-gray-50/30 border-b">
                      <TableCell className="text-center">
                        <span className="text-primary font-medium text-xs lg:text-sm">
                          {index + 1}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 lg:py-4">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <Avatar className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-white shadow-sm">
                            {user.avatar ? (
                              <AvatarImage
                                src={user.avatar}
                                alt={user.displayName || 'User'}
                                className="object-cover"
                              />
                            ) : null}
                            <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-xs uppercase">
                              {getInitials(user.displayName || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <div className="font-medium text-xs lg:text-sm text-gray-900 capitalize">
                              {user.displayName || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-left hidden lg:table-cell">
                        <span className="text-gray-700 text-xs lg:text-sm">
                          {user.email || 'No email'}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-left">
                        <span className="text-gray-900 text-xs lg:text-sm capitalize">
                          {user.authType || 'Email'}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-left">
                        <span className="text-gray-900 text-xs lg:text-sm">
                          {formatDate(user.createdAt)}
                        </span>
                      </TableCell>

                      <TableCell className="text-left">
                        <Badge
                          className={`px-2 lg:px-3 py-1 rounded-full font-medium text-xs capitalize ${getStatusBadgeColor(user.status)}`}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onViewDetails?.(user.id || '')}
                              className="cursor-pointer text-primary"
                            >
                              <Eye className="mr-2 h-4 w-4 text-primary" />
                              View User
                            </DropdownMenuItem>
                            {user.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => onBlock?.(user.id || '')}
                                className="cursor-pointer text-orange-600 hover:text-orange-700"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Block User
                              </DropdownMenuItem>
                            ) : user.status === 'inactive' ? (
                              <DropdownMenuItem
                                onClick={() => onUnblock?.(user.id || '')}
                                className="cursor-pointer text-green-600 hover:text-green-700"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Unblock User
                              </DropdownMenuItem>
                            ) : null}
                            {user.status !== 'deleted' && (
                              <DropdownMenuItem
                                onClick={() => onDelete?.(user.id || '')}
                                className="cursor-pointer text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};