import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { ContentType } from '../services/cmsService';
import { useCmsContentQuery, useCreateOrUpdateCmsMutation } from '../hooks/useCmsMutations';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

const defaultTermsAndConditions = `
Last Updated: 27 Aug 2025

Welcome to Source Build. These Terms & Conditions ("Terms") govern your use of our website, mobile application, and services (collectively, the “Platform”). By accessing or using our Platform, you agree to be bound by these Terms.

1. Eligibility

You must be at least 18 years old to use our Platform.
By registering, you confirm that the information provided is true and accurate.

2. Products & Orders

We sell furniture, appliances, and related goods.
Product descriptions, images, and specifications are provided for reference. While we aim for accuracy, slight variations may occur.
Placing an order does not guarantee acceptance. We reserve the right to cancel or refuse orders at our discretion.

3. Pricing & Payments

Prices are listed in currency.
We reserve the right to change prices without prior notice.
Payments must be made via approved methods on our Platform (e.g., credit card, debit card, UPI, net banking, wallet, etc.).

4. Shipping & Delivery

Delivery timelines are estimates and may vary due to factors beyond our control.
Ownership of goods passes to you once the product is delivered.
You must inspect items upon delivery and report any damage within 48 hours.

5. Returns & Refunds

Eligible items may be returned within X days of delivery, subject to our Return Policy.
Refunds will be processed via the original payment method within X business days.
Customized or used items may not be eligible for return.

6. User Responsibilities

You agree not to misuse the Platform, engage in fraud, or violate applicable laws.
You are responsible for maintaining account confidentiality.

7. Intellectual Property

All content, trademarks, and materials on Source Build are owned by us or our licensors.
You may not copy, reproduce, or distribute without written permission.

8. Limitation of Liability

We are not liable for indirect, incidental, or consequential damages arising from your use of our Platform.
Product warranties (if applicable) are provided by manufacturers.

9. Governing Law

These Terms shall be governed by the laws of Your Country/State.
Any disputes shall be subject to the jurisdiction of courts in City, Country.

10. Changes to Terms

We reserve the right to update these Terms at any time. Continued use of the Platform indicates your acceptance of the updated Terms.

11. Contact Us

For questions, contact us at:
📧 Email: support@sourcebuild.com
📞 Phone: +91-XXXXXXXXXX`;

const TermsAndConditionsPage: React.FC = () => {
  const { user } = useAuth();
  const isSeller = user?.role === 'seller';
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Fetch CMS content for sellers
  const { data, isLoading, error } = useCmsContentQuery(
    isSeller ? ContentType.TERMS_CONDITIONS : undefined
  );

  const createOrUpdateMutation = useCreateOrUpdateCmsMutation();
  const content = data?.data;

  // Initialize edit content when data loads
  useEffect(() => {
    if (content) {
      setEditContent(content.content);
    } else if (!content && isSeller) {
      // If no content exists, use default
      setEditContent(defaultTermsAndConditions);
    }
  }, [content, isSeller]);

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200 shadow-none">
        <CardContent className="px-4 sm:px-6 py-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && isSeller) {
    return (
      <Card className="bg-white border-gray-200 shadow-none">
        <CardContent className="px-4 sm:px-6 py-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Terms & Conditions</h2>
          <p className="text-red-500">Failed to load content. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const displayContent = content?.content || defaultTermsAndConditions;
  const displayTitle = content?.title || 'Terms & Conditions';
  const lastUpdated = content?.updatedAt;

  const handleEdit = () => {
    setIsEditing(true);
    if (!content) {
      setEditContent(defaultTermsAndConditions);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original content
    if (content) {
      setEditContent(content.content);
    } else {
      setEditContent(defaultTermsAndConditions);
    }
  };

  const handleSave = async () => {
    try {
      await createOrUpdateMutation.mutateAsync({
        type: ContentType.TERMS_CONDITIONS,
        title: 'Terms & Conditions',
        content: editContent,
        isActive: true,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  return (
    <Card className="bg-white border-gray-200 shadow-none">
      <CardContent className="px-4 sm:px-6 py-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">{displayTitle}</h2>
            {lastUpdated && !isEditing && (
              <span className="text-xs text-gray-500 my-2">
                Last Updated {formatDate(lastUpdated)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isSeller && !isEditing && (
              <Button
                onClick={handleEdit}
                className="flex items-center gap-1 h-12   text-white hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-vertical text-sm"
              placeholder="Enter your terms and conditions..."
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={createOrUpdateMutation.isPending}
                className="flex items-center gap-1 w-[128px] border-gray-500 text-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createOrUpdateMutation.isPending || !editContent.trim()}
                className="flex items-center gap-1 text-white hover:text-white w-[128px]"
              >
                {createOrUpdateMutation.isPending ? 'updating...' : 'Update'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
            {displayContent}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TermsAndConditionsPage;
