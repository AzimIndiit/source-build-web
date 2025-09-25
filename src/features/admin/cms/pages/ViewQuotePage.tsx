import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import CommonModal from '@/components/common/CommonModal';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import { useQuoteQuery } from '../hooks/useCmsMutations';
import { useGetOrCreateChatMutation } from '@/features/messages/hooks/useChatQueries';

// Reply form schema
const replySchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

type ReplyForm = z.infer<typeof replySchema>;

const ViewQuotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch quote details
  const { data: quote, isLoading } = useQuoteQuery(id || '');
  const { mutate: getOrCreateChat, isPending } = useGetOrCreateChatMutation();

  const handleReply = () => {
    if (quote?.user?.id) {
      getOrCreateChat({ participantId: quote?.user?.id });
    }
  };

  // Format display values
  const formatValue = (value: string | undefined) => {
    if (!value) return 'N/A';
    // Format enum values (e.g., 'new-construction' -> 'New Construction')
    return value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mock data for demonstration (remove when API is integrated)
  const mockQuote = quote || {
    id: '1',
    user: {
      displayName: 'John Doe',
      email: 'john.doe@example.com',
    },
    projectType: 'new-construction',
    installationLocation: 'kitchen',
    spaceWidth: 1000,
    spaceHeight: 1000,
    existingDesign: 'blueprints',
    cabinetStyle: 'flat-panel',
    material: 'plywood',
    finishColor: 'painted',
    additionalComments: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    images: [],
    status: 'pending' as const,
    quotedPrice: undefined,
    estimatedTime: undefined,
    responseNotes: undefined,
  };

  return (
    <>
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">View Quote</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleReply}
                className="min-w-[140px] bg-primary text-white hover:bg-primary/90 h-12"
                disabled={isPending}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Reply
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/quote')}
                className="min-w-[140px] border-primary text-primary hover:bg-primary/10 h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Customer Information */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Name</h4>
                  <p className="text-base text-gray-900">{mockQuote.user?.displayName || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Email</h4>
                  <p className="text-base text-gray-900">{mockQuote.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Basic Project Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    What is the project type?
                  </h4>
                  <p className="text-base text-gray-900">{formatValue(mockQuote.projectType)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    What is the installation location?
                  </h4>
                  <p className="text-base text-gray-900">
                    {formatValue(mockQuote.installationLocation)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    What are the dimensions of the space?
                  </h4>
                  <p className="text-base text-gray-900">
                    {mockQuote.spaceWidth} x {mockQuote.spaceHeight}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    Do you have a layout or design already?
                  </h4>
                  <p className="text-base text-gray-900">{formatValue(mockQuote.existingDesign)}</p>
                </div>
              </div>
            </div>

            {/* Cabinet Style & Material */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cabinet Style & Material</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    What cabinet style do you prefer?
                  </h4>
                  <p className="text-base text-gray-900">{formatValue(mockQuote.cabinetStyle)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    What material do you want?
                  </h4>
                  <p className="text-base text-gray-900">{formatValue(mockQuote.material)}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    What finish or color are you looking for?
                  </h4>
                  <p className="text-base text-gray-900">{formatValue(mockQuote.finishColor)}</p>
                </div>
              </div>
            </div>

            {/* Images */}
            {mockQuote.images && mockQuote.images.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-4">Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mockQuote.images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Quote image ${index + 1}`}
                      className="w-32 h-32 aspect-square rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setImagePreviewOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            {mockQuote.additionalComments && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Comments</h4>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {mockQuote.additionalComments}
                </p>
              </div>
            )}

            {/* Quote Response (if provided) */}
            {mockQuote.quotedPrice && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Response</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Quoted Price</h4>
                    <p className="text-base text-gray-900">${mockQuote.quotedPrice}</p>
                  </div>
                  {mockQuote.estimatedTime && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Estimated Time</h4>
                      <p className="text-base text-gray-900">{mockQuote.estimatedTime}</p>
                    </div>
                  )}
                  {mockQuote.responseNotes && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Response Notes</h4>
                      <p className="text-base text-gray-900">{mockQuote.responseNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {mockQuote.images && mockQuote.images.length > 0 && (
        <ImagePreviewModal
          images={mockQuote.images}
          open={imagePreviewOpen}
          onClose={() => setImagePreviewOpen(false)}
          currentIndex={currentImageIndex}
          setCurrentIndex={setCurrentImageIndex}
        />
      )}
    </>
  );
};

export default ViewQuotePage;
