import React from 'react';
import { CircleCheck } from 'lucide-react';

interface HeroSectionProps {
  mainImage: string;
  mainImageAlt?: string;
  secondaryImage?: string;
  secondaryImageAlt?: string;
  features: string[];
}

const HeroSection: React.FC<HeroSectionProps> = ({
  mainImage,
  mainImageAlt = 'Main product image',
  secondaryImage,
  secondaryImageAlt = 'Secondary product image',
  features,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 bg-white rounded-sm p-4">
      {/* Main Image */}
      <div className="lg:col-span-5">
        <div className="rounded-lg overflow-hidden shadow-sm">
          <img src={mainImage} alt={mainImageAlt} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Secondary Image */}
      {secondaryImage && (
        <div className="lg:col-span-2">
          <div className="rounded-lg overflow-hidden shadow-sm">
            <img
              src={secondaryImage}
              alt={secondaryImageAlt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Features List */}
      <div className={secondaryImage ? 'lg:col-span-5' : 'lg:col-span-7'}>
        <div className="h-full flex flex-col justify-center">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CircleCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
