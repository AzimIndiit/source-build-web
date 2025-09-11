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
import { useLocation } from 'react-router';

const defaultPrivacyPolicy = `
Last Updated: 27 Aug 2025

Your privacy is important to us at Source Build. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.

1. Information We Collect

Personal Information:
• Name, email address, phone number
• Billing and shipping addresses
• Payment information
• Account credentials

Usage Information:
• Browser type and version
• Device information
• IP address
• Pages visited and time spent
• Purchase history

2. How We Use Your Information

We use your information to:
• Process orders and payments
• Provide customer support
• Send order updates and notifications
• Improve our services
• Comply with legal obligations
• Prevent fraud and enhance security

3. Information Sharing

We may share your information with:
• Service providers (payment processors, shipping partners)
• Law enforcement when required by law
• Business partners with your consent
• In connection with business transfers or acquisitions

We do NOT sell your personal information to third parties.

4. Data Security

We implement appropriate technical and organizational measures to protect your information, including:
• SSL encryption for data transmission
• Secure servers and databases
• Regular security audits
• Limited access to personal information

5. Your Rights

You have the right to:
• Access your personal information
• Correct inaccurate data
• Request deletion of your data
• Opt-out of marketing communications
• Data portability

6. Cookies

We use cookies and similar technologies to:
• Maintain your session
• Remember preferences
• Analyze site usage
• Provide targeted advertising

You can manage cookie preferences through your browser settings.

7. Children's Privacy

Our platform is not intended for children under 18. We do not knowingly collect information from minors.

8. International Data Transfers

Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.

9. Data Retention

We retain your information for as long as necessary to:
• Provide our services
• Comply with legal obligations
• Resolve disputes
• Enforce agreements

10. Changes to This Policy

We may update this Privacy Policy periodically. Continued use of our platform constitutes acceptance of changes.

11. Contact Us

For privacy-related questions:
📧 Email: privacy@sourcebuild.com
📞 Phone: +91-XXXXXXXXXX
🏢 Address: Your Business Address Here

Last updated: [Date]
Effective date: [Date]`;

const PrivacyPolicyPage: React.FC = () => {
  const { user } = useAuth();
  const location =useLocation()
  const isSeller = user?.role === 'seller';
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('Privacy Policy');

  // Fetch CMS content for sellers
  const { data, isLoading, error } = useCmsContentQuery(
    isSeller ? ContentType.PRIVACY_POLICY : undefined
  );

  const createOrUpdateMutation = useCreateOrUpdateCmsMutation();
  const content = data?.data;

  // Initialize edit content when data loads
  useEffect(() => {
    if (content) {
      setEditContent(content.content);
      setEditTitle(content.title);
    } else if (!content && isSeller) {
      // If no content exists, use default
      setEditContent(defaultPrivacyPolicy);
      setEditTitle('Privacy Policy');
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
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Privacy Policy</h2>
          <p className="text-red-500">Failed to load content. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const displayContent = content?.content || defaultPrivacyPolicy;
  const displayTitle = content?.title || 'Privacy Policy';
  const lastUpdated = content?.lastUpdated;

  const handleEdit = () => {
    setIsEditing(true);
    if (!content) {
      setEditContent(defaultPrivacyPolicy);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original content
    if (content) {
      setEditContent(content.content);
      setEditTitle(content.title);
    } else {
      setEditContent(defaultPrivacyPolicy);
      setEditTitle('Privacy Policy');
    }
  };

  const handleSave = async () => {
    try {
      await createOrUpdateMutation.mutateAsync({
        type: ContentType.PRIVACY_POLICY,
        title: editTitle,
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
         {location.pathname !== '/privacy' &&  <div className="flex items-center gap-2">
            {isSeller && !isEditing && (
              <Button
                onClick={handleEdit}
                className="flex items-center gap-1 h-12   text-white hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>}
        </div>

        {/* Main Content */}
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-vertical text-sm"
              placeholder="Enter your privacy policy..."
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
                {createOrUpdateMutation.isPending ? 'Saving...' : 'Save'}
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

export default PrivacyPolicyPage;
