import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { ContentType } from '../services/cmsService';
import { useCmsContentQuery } from '../hooks/useCmsMutations';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const AboutUsPage: React.FC = () => {
  const { user } = useAuth();
  const isSeller = user?.role === 'seller';

  // Fetch CMS content for sellers
  const { data, isLoading, error } = useCmsContentQuery(
    isSeller ? ContentType.ABOUT_US : undefined
  );

  const content = data?.data;

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
          <h2 className="text-lg sm:text-xl font-semibold mb-4">About Us</h2>
          <p className="text-red-500">Failed to load content. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  // Default content for buyers or when no content is set
  const defaultContent = `Welcome to Source Build, your premier e-commerce marketplace for furniture, appliances, and home goods.

Our Mission

We connect buyers with trusted sellers to provide quality products at competitive prices. Our platform ensures seamless transactions, reliable delivery, and excellent customer service.

What We Offer

• Wide Selection: Browse thousands of products from verified sellers
• Secure Payments: Safe and encrypted payment processing
• Fast Delivery: Efficient logistics network for timely deliveries
• Quality Assurance: All sellers are vetted for quality and reliability
• Customer Support: 24/7 support for all your needs

Why Choose Source Build?

1. Trusted Platform: Years of experience in e-commerce
2. Best Prices: Competitive pricing with regular deals
3. Easy Returns: Hassle-free return policy
4. Seller Network: Curated network of reliable sellers
5. Technology Driven: Modern platform with user-friendly interface

Contact Us

📧 Email: support@sourcebuild.com
📞 Phone: +91-XXXXXXXXXX
🏢 Address: Your Business Address Here

Join thousands of satisfied customers who trust Source Build for their home furnishing needs.`;

  const displayContent = content?.content || defaultContent;
  const displayTitle = content?.title || 'About Us';
  const lastUpdated = content?.lastUpdated;

  return (
    <Card className="bg-white border-gray-200 shadow-none">
      <CardContent className="px-4 sm:px-6 py-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">{displayTitle}</h2>
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Main Content */}
        <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
          {displayContent}
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutUsPage;
