import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Car, Package2, Shield, Zap } from 'lucide-react';
import { HeaderMenu } from '@/components/navigation/HeaderMenu';
import CustomSlider from './home/components/SingleSlider';
import SmallCardComponent from './home/components/SmallCardComponent';
import IMAGES from '@/config/constants';
import HomeFooter from './home/components/HomeFooter';
import MultiSliderSlider from './home/components/MultiSliderSlider';
import ProductCarousel from '../components/ProductCarousel';
import { HomePageSkeleton } from '../components/SkeletonLoader';

interface Slide {
  title: React.ReactNode;
  image: string;
  description: string;
}

function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const slides: Slide[] = [
    {
      title: (
        <>
          Find the Perfect <br /> <span className="text-primary">Cabinets</span> for Your Space.
        </>
      ),
      image: IMAGES.Slider_IMG,
      description:
        'Explore a wide selection of kitchen and bathroom cabinets, from Ready-To-Assemble (RTA) to fully assembled options. Compare styles, materials, and finishes, and get them delivered or installed with ease.',
    },
    {
      title: (
        <>
          Transform Your <br /> <span className="text-primary">Kitchen</span> Today.
        </>
      ),
      image: IMAGES.Slider_IMG,
      description:
        "Discover premium kitchen cabinets that combine style and functionality. From modern designs to classic elegance, find the perfect cabinets to enhance your home's beauty and value.",
    },
    {
      title: (
        <>
          Expert <br /> <span className="text-primary">Installation</span> Services.
        </>
      ),
      image: IMAGES.Slider_IMG,
      description:
        'Professional installation services to ensure your cabinets are perfectly fitted and aligned. Our experienced team handles everything from measurement to final installation.',
    },
  ];

  const baseboards_data = [
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_1,
      price: '12.25 per sq ft',
      description: 'Exterior Glass door with frosted...',
      location: 'South Jordan, UT',
      seller: 'Sohi Ent',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_2,
      price: '0.5 per linear ft',
      description: 'Mixed Hardwood 5”x10’5”x10”',
      location: 'Lehi, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Next-day delivery',
      image: IMAGES.Slider_3,
      price: '23.05 per sq ft',
      description: 'Premium Cedar Siding',
      location: 'Centerville, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_4,
      price: '15 per linear ft',
      description: 'Primed MDF 3.25″ Casing',
      location: 'Washington | US',
      seller: 'Nilkanth Ent',
    },
    {
      delivery: 'Next-day delivery',
      image: IMAGES.Slider_1,
      price: '12.25 per sq ft',
      description: 'Exterior Glass door with frosted...',
      location: 'South Jordan, UT',
      seller: 'Sohi Ent',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_2,
      price: '0.5 per linear ft',
      description: 'Mixed Hardwood 5”x10’5”x10”',
      location: 'Lehi, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_3,
      price: '23.05 per sq ft',
      description: 'Premium Cedar Siding',
      location: 'Centerville, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Next-day delivery',
      image: IMAGES.Slider_4,
      price: '15 per linear ft',
      description: 'Primed MDF 3.25″ Casing',
      location: 'Washington | US',
      seller: 'Nilkanth Ent',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_1,
      price: '12.25 per sq ft',
      description: 'Exterior Glass door with frosted...',
      location: 'South Jordan, UT',
      seller: 'Sohi Ent',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_2,
      price: '0.5 per linear ft',
      description: 'Mixed Hardwood 5”x10’5”x10”',
      location: 'Lehi, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Next-day delivery',
      image: IMAGES.Slider_3,
      price: '23.05 per sq ft',
      description: 'Premium Cedar Siding',
      location: 'Centerville, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_4,
      price: '15 per linear ft',
      description: 'Primed MDF 3.25″ Casing',
      location: 'Washington | US',
      seller: 'Nilkanth Ent',
    },
  ];
  const trusses_data = [
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_6,
      price: '250 per sq ft',
      description: 'Steel Columns',
      location: 'Draper, UT',
      seller: 'Anjaney Enterprise',
    },
    {
      delivery: 'Next-day delivery',
      image: IMAGES.Slider_7,
      price: '12.25 per sq ft',
      description: 'HeightWood Columns',
      location: 'South Jordan, UT',
      seller: 'Sohi Ent',
    },
    {
      delivery: 'Next-day delivery',
      image: IMAGES.Slider_8,
      price: '10.2 per sq ft',
      description: 'Concrete Columns',
      location: 'Lehi, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Bridge & Industrial Trusses',
      image: IMAGES.Slider_9,
      price: '23.05 per sq ft',
      description: 'Concrete Columns',
      location: 'Centerville, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_10,
      price: '15 per linear ft',
      description: 'Roof Trusses',
      location: 'Washington | US',
      seller: 'Nilkanth Ent',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_6,
      price: '250 per sq ft',
      description: 'Steel Columns',
      location: 'Draper, UT',
      seller: 'Anjaney Enterprise',
    },
    {
      delivery: 'Next-day delivery',
      image: IMAGES.Slider_7,
      price: '12.25 per sq ft',
      description: 'HeightWood Columns',
      location: 'South Jordan, UT',
      seller: 'Sohi Ent',
    },
    {
      delivery: 'Next-day delivery',
      image: IMAGES.Slider_8,
      price: '10.2 per sq ft',
      description: 'Concrete Columns',
      location: 'Lehi, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Bridge & Industrial Trusses',
      image: IMAGES.Slider_9,
      price: '23.05 per sq ft',
      description: 'Concrete Columns',
      location: 'Centerville, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_10,
      price: '15 per linear ft',
      description: 'Roof Trusses',
      location: 'Washington | US',
      seller: 'Nilkanth Ent',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_6,
      price: '250 per sq ft',
      description: 'Steel Columns',
      location: 'Draper, UT',
      seller: 'Anjaney Enterprise',
    },
    {
      delivery: 'Next-day delivery',
      image: IMAGES.Slider_7,
      price: '12.25 per sq ft',
      description: 'HeightWood Columns',
      location: 'South Jordan, UT',
      seller: 'Sohi Ent',
    },
    {
      delivery: 'Next-day delivery',
      image: IMAGES.Slider_8,
      price: '10.2 per sq ft',
      description: 'Concrete Columns',
      location: 'Lehi, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Bridge & Industrial Trusses',
      image: IMAGES.Slider_9,
      price: '23.05 per sq ft',
      description: 'Concrete Columns',
      location: 'Centerville, UT',
      seller: 'Aney Enterprise',
    },
    {
      delivery: 'Same-day delivery',
      image: IMAGES.Slider_10,
      price: '15 per linear ft',
      description: 'Roof Trusses',
      location: 'Washington | US',
      seller: 'Nilkanth Ent',
    },
  ];
  if (isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderMenu />
      <CustomSlider slides={slides} />
      <div className="relative mt-[-50px] sm:mt-[-100px] md:mt-[-150px] lg:mt-[-200px] w-full z-10 px-4 sm:px-6 lg:px-8">
        <SmallCardComponent />
      </div>

      <section className="py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 space-y-4 sm:space-y-6 md:space-y-8 max-w-[100vw]  mx-auto overflow-hidden">
        <Card className="w-full text-left border-gray-100 gap-0 bg-white py-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 p-2 sm:p-3 md:p-4">
            Baseboards, Casing, Trim & Crown
          </h2>
          <div className="">
            <MultiSliderSlider slides={baseboards_data} />
          </div>
        </Card>
        <Card className="w-full text-left border-gray-100 gap-0 bg-white py-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 text-left p-2 sm:p-3 md:p-4">
            Trusses, Beams & Columns
          </h2>
          <div className="">
            <MultiSliderSlider slides={trusses_data} />
          </div>
        </Card>
      </section>
    </div>
  );
}

export default HomePage;
