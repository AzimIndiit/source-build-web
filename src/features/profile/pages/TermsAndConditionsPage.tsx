import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

const mockTermsAndConditions = `
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
  return (
    <Card className="bg-white border-gray-200 shadow-none">
      <CardContent className="px-4 sm:px-6">
        <h2 className="text-lg sm:text-xl font-semibold">Terms & Conditions</h2>

        {/* Main Content */}
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
          {mockTermsAndConditions}
        </p>
      </CardContent>
    </Card>
  );
};

export default TermsAndConditionsPage;
