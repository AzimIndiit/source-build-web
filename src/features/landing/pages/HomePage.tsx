import { Card } from '@/components/ui/Card';
import { HeaderMenu } from '@/components/navigation/HeaderMenu';
import CustomSlider from './home/components/SingleSlider';
import SmallCardComponent from './home/components/SmallCardComponent';
import IMAGES from '@/config/constants';
import MultiSliderSlider from './home/components/MultiSliderSlider';
import { HomePageSkeleton } from '../components/SkeletonLoader';
import { useCmsContentQuery } from '@/features/profile/hooks/useCmsMutations';
import { ContentType } from '@/features/profile/services/cmsService';

interface Slide {
  title: React.ReactNode;
  image: string;
  description: string;
  items?: any[];
}

interface LandingPageData {
  _id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  sections: Array<{
    id: string;
    type: 'hero' | 'categories' | 'products';
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    items?: any[];
    products?: Array<{
      id: string;
      title: string;
      image: string;
      price: string;
      priceType?: string;
      readyByDays?: string;
      description: string;
      location: string;
      seller: string;
      link: string;
    }>;
    categories?: Array<{
      id: string;
      name: string;
      title: string;
      image: string;
      imageUrl: string;
      link: string;
    }>;
    expandAllButton?: {
      title: string;
      link: string;
    };
    order?: number;
  }>;
  isActive: boolean;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
}

function HomePage() {
  const { data, isLoading } = useCmsContentQuery(ContentType.LANDING_PAGE);

  const landingPage = data?.data as LandingPageData;

  // Helper functions to transform API data to existing component formats
  const getHeroSlides = (): Slide[] => {
    if (!landingPage?.sections) return getDefaultSlides();

    const heroSections = landingPage.sections.filter((section) => section.type === 'hero');
    if (heroSections.length === 0) return getDefaultSlides();

    return heroSections.map((section) => ({
      title: section.title ? (
        <>{section.title}</>
      ) : (
        <>
          Find the Perfect <br /> <span className="text-primary">Cabinets</span> for Your Space.
        </>
      ),
      image: section.backgroundImage || IMAGES.Slider_IMG,
      description:
        section.subtitle ||
        'Explore a wide selection of kitchen and bathroom cabinets, from Ready-To-Assemble (RTA) to fully assembled options. Compare styles, materials, and finishes, and get them delivered or installed with ease.',
      items: section.items,
    }));
  };

  const getDefaultSlides = (): Slide[] => {
    return [
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
  };

  const getProductSections = () => {
    if (!landingPage?.sections) return [];

    return landingPage.sections.filter((section) => section.type === 'products');
  };

  const getCategorySections = () => {
    if (!landingPage?.sections) return [];

    return landingPage.sections.filter((section) => section.type === 'categories');
  };

  // Get slides for CustomSlider (hero sections)
  const slides: Slide[] = getHeroSlides();

  // Get product sections for MultiSliderSlider
  const productSections = getProductSections();

  // Get category sections for SmallCardComponent
  const categorySections = getCategorySections();

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
      {/* hero section */}
      <CustomSlider slides={slides} />
      {/* Collection section */}
      <div className="relative sm:mt-[-100px] md:mt-[-150px] lg:mt-[-200px] w-full z-10 ">
        <SmallCardComponent categoriesData={categorySections} />
      </div>
      {/* products section */}
      <section className="py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 space-y-4 sm:space-y-6 md:space-y-8 max-w-[100vw]  mx-auto overflow-hidden">
        {/* Render product sections from API or fallback to default */}
        {productSections.length > 0 ? (
          productSections.map((section, index) => {
            // Use populated products data or items as fallback
            const productsData = section.products || section.items || [];

            // Transform API product data to MultiSliderSlider format
            const transformedSlides = productsData.map((item) => ({
              id: item.id,
              image: item.image || IMAGES.Slider_1,
              delivery:
                item.readyByDays === '0'
                  ? 'Same-day delivery'
                  : item.readyByDays === '1'
                    ? 'Next-day delivery'
                    : 'Standard delivery',
              price: item.price || '0.00',
              priceType: item.priceType,
              readyByDays: item.readyByDays,
              description: item.description || item.title || '',
              location: item.location || 'Various Locations',
              seller: item.seller || 'Source Build',
              slug: item.link?.replace('/marketplace/product/', '') || '',
              isInWishlist: false, // This would come from wishlist state
              readyByDate: item.readyByDays,
              inStock: true, // This should come from backend
            }));

            return (
              <Card
                key={section.id || index}
                className="w-full text-left border-gray-100 gap-0 bg-white py-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 p-2 sm:p-3 md:p-4">
                  {section.title || `Products Section ${index + 1}`}
                </h2>
                {section.subtitle && (
                  <p className="text-sm text-gray-600 px-2 sm:px-3 md:px-4 pb-2">
                    {section.subtitle}
                  </p>
                )}
                <div className="px-4">
                  <MultiSliderSlider slides={transformedSlides} />
                </div>
              </Card>
            );
          })
        ) : (
          // Fallback to default product sections
          <>
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
          </>
        )}
      </section>
    </div>
  );
}

export default HomePage;
