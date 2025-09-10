import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/helpers';
import { Order } from '@/features/dashboard/types';
import { Card } from '@/components/ui/Card';

interface TimelineItem {
  title: string;
  description: string;
  date: string;
  completed: boolean;
  isLast?: boolean;
}

interface BookingStatusProps {
  order: Order;
}

const getTimelineItems = (status: string, orderDate: string): TimelineItem[] => {
  const baseDate = new Date(orderDate);
  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }) +
      ' at ' +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const allSteps: TimelineItem[] = [
    {
      title: 'Order Received',
      description: 'New order received and pending confirmation',
      date: formatDate(baseDate),
      completed: false,
    },
    {
      title: 'Order Confirmed',
      description: 'Order has been confirmed and is being prepared.',
      date: formatDate(new Date(baseDate.getTime() + 60 * 60 * 1000)), // +1 hour
      completed: false,
    },
    {
      title: 'In Transit',
      description: 'Shipment arrived at Driver location',
      date: formatDate(new Date(baseDate.getTime() + 8 * 60 * 60 * 1000)), // +8 hours
      completed: false,
    },
    {
      title: 'Out for Delivery',
      description: 'Driver has picked up the order and is en route to the customer.',
      date: formatDate(new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)), // +1 day
      completed: false,
    },
    {
      title: 'Delivered',
      description: 'Order successfully delivered to the customer.',
      date: formatDate(new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)), // +1 day
      completed: false,
    },
  ];

  // Mark steps as completed based on status
  switch (status.toLowerCase()) {
    case 'pending':
      allSteps[0].completed = true; // Order Received
      break;
    case 'processing':
      allSteps[0].completed = true; // Order Received
      allSteps[1].completed = true; // Order Confirmed
      break;
    case 'in transit':
      allSteps[0].completed = true; // Order Received
      allSteps[1].completed = true; // Order Confirmed
      allSteps[2].completed = true; // In-Transit
      break;
    case 'out for delivery':
      allSteps[0].completed = true; // Order Received
      allSteps[1].completed = true; // Order Confirmed
      allSteps[2].completed = true; // In-Transit
      allSteps[3].completed = true; // Out for Delivery
      break;
    case 'delivered':
      allSteps.forEach((step) => (step.completed = true)); // All completed
      break;
    case 'cancelled':
      // For cancelled orders, show only relevant steps
      return [
        {
          title: 'Order Received',
          description: 'New order received and pending confirmation',
          date: formatDate(baseDate),
          completed: true,
        },
        {
          title: 'Order Cancelled',
          description: 'Order has been cancelled',
          date: formatDate(new Date()),
          completed: true,
          isLast: true,
        },
      ];
    default:
      allSteps[0].completed = true; // At least order received
  }

  // Mark the last item
  allSteps[allSteps.length - 1].isLast = true;

  return allSteps;
};

export const BookingStatus: React.FC<BookingStatusProps> = ({ order }) => {
  const items = getTimelineItems(order.status, order.date);
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-gray-900">Booking Status</h2>

      <Card className="relative p-4 border-gray-200 shadow-none gap-0">
        {items.map((item, index) => (
          <div key={index} className="flex gap-4 relative">
            {/* Timeline Line and Circle */}
            <div className="flex flex-col items-center">
              {/* Circle with checkmark */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center z-10',
                  item.completed ? 'bg-green-500' : 'bg-gray-300'
                )}
              >
                {item.completed ? (
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                ) : (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-300">
                    <span className="text-xs text-gray-500">{index + 1}</span>
                  </div>
                )}
              </div>

              {/* Vertical line */}
              {!item.isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 ',
                    item.completed && index == items.length - 1 ? 'bg-green-500' : 'bg-gray-300'
                  )}
                  style={{ minHeight: '80px' }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{item.description}</p>
              <p className="text-xs text-gray-400">{item.date}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
