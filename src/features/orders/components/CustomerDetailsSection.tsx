import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquareMore } from 'lucide-react';
import { Card, StarRating } from '@/components/ui';
import { useGetOrCreateChatMutation } from '@/features/messages/hooks/useChatQueries';

interface CustomerDetailsSectionProps {
  title?: string;
  reviewTitle?: string;
  customerDetails?: {
    id: string;
    displayName: string;
    email: string;
    avatar?: string;
    rating?: number;
    review?: string;
  };
}

export const CustomerDetailsSection: React.FC<CustomerDetailsSectionProps> = ({
  customerDetails,
  title = 'Customer Details',
  reviewTitle = 'Reviews & Rating From Customer',
}) => {
  const { mutate: getOrCreateChat ,isPending} = useGetOrCreateChatMutation();

  const handleMessageClick = () => {
    if (customerDetails?.id) {
      getOrCreateChat({ participantId: customerDetails.id });
    }
  };
  return (
    <div className="space-y-4">
      {/* Customer Details Card */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900 capitalize">{title}</h2>

        <Card className="bg-white rounded-sm border border-gray-200 shadow-none p-4">
          {/* Customer Info Box */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                {customerDetails?.avatar ? (
                  <AvatarImage
                    src={customerDetails.avatar}
                    alt={customerDetails.displayName}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className=" font-medium text-lg">
                  {customerDetails?.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 text-base capitalize">
                  {customerDetails?.displayName}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{customerDetails?.email}</p>
              </div>
            </div>
            <button
             disabled={isPending}
              className="p-3 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors cursor-pointer"
              onClick={handleMessageClick}
            >
             {isPending? <Loader2 className='animate-spin h-5 w-5 text-primary'/> : <MessageSquareMore className="w-5 h-5 text-primary " />}
            </button>
          </div>
        </Card>
      </div>

      {/* Reviews & Rating From Customer */}
      {customerDetails?.rating && customerDetails?.rating > 0 ? (
        <div className="space-y-2">
          <h2 className="font-medium text-gray-900 text-lg capitalize">{reviewTitle}</h2>

          <Card className="p-4 border-gray-200 gap-3">
            <div className="">
              <StarRating size="h-6 w-6" rating={customerDetails?.rating || 0} />
            </div>

            <p className="text-gray-500 leading-relaxed text-[15px] capitalize">
              {customerDetails?.review}
            </p>
          </Card>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};
