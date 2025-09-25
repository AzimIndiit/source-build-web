import { Skeleton } from '@/components/ui/skeleton';
import { useCmsContentQuery } from '@/features/profile/hooks/useCmsMutations';
import { ContentType } from '@/features/profile/services/cmsService';
import React from 'react';

const defaultPrivacyPolicy = `
Last Updated: 27 Aug 2025

At Source Build, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.

1. Information We Collect

Personal Information: Name, email address, phone number, shipping address, billing information
Account Information: Username, password, profile details
Transaction Information: Order history, payment details, shipping information
Usage Information: Browser type, IP address, device information, pages visited

2. How We Use Your Information

To process and fulfill your orders
To communicate with you about your account or transactions
To send promotional materials and updates (with your consent)
To improve our services and user experience
To comply with legal obligations

3. Information Sharing

We may share your information with:
- Service providers (payment processors, shipping companies)
- Business partners (with your consent)
- Law enforcement (when required by law)

We do not sell your personal information to third parties.

4. Data Security

We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.

5. Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Opt-out of marketing communications
- Data portability

6. Cookies

We use cookies and similar tracking technologies to enhance your experience on our platform. You can manage cookie preferences through your browser settings.

7. Children's Privacy

Our services are not intended for children under 18. We do not knowingly collect information from children.

8. International Data Transfers

Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.

9. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification.

10. Contact Us

If you have questions about this Privacy Policy, please contact us at:
📧 Email: privacy@sourcebuild.com
📞 Phone: +91-XXXXXXXXXX
📍 Address: Source Build, City, State, Country`;

const PublicPrivacyPage: React.FC = () => {
  const { data, isLoading, error } = useCmsContentQuery(ContentType.PRIVACY_POLICY);
  const content = data?.data;
  if (isLoading) {
    return <Skeleton className="h-8 w-48 mb-4" />;
  }
  if (error) {
    return <div className="text-red-500" >Error loading content</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className=" mx-auto bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          {content?.title || 'Privacy Policy'}
        </h1>
        <div className="prose prose-gray max-w-none">
          <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
            {content?.content || defaultPrivacyPolicy}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPrivacyPage;