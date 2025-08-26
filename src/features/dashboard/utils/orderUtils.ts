import { OrderStatus } from '../types';

export const getStatusBadgeColor = (status: OrderStatus): string => {
  switch (status) {
    case 'Delivered':
      return 'bg-[#34a853] hover:bg-[#34a853] text-white';
    case 'Processing':
      return 'bg-[#1c77ee] hover:bg-[#1c77ee] text-white';
    case 'Pending':
      return 'bg-[#eb9114] hover:bg-[#eb9114] text-white';
    case 'Cancelled':
      return 'bg-[#ff0008] hover:bg-[#ff0008] text-white';
    case 'Out for Delivery':
      return 'bg-[#00b8d4] hover:bg-[#00b8d4] text-white';
    case 'In Transit':
      return 'bg-[#9c27b0] hover:bg-[#9c27b0] text-white';
    default:
      return 'bg-gray-500 hover:bg-gray-500 text-white';
  }
};
