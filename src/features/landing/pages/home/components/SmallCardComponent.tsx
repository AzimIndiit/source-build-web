import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import IMAGES from '@/config/constants';

interface DealItem {
  img: string;
  name: string;
}

interface DealData {
  title: string;
  items: DealItem[];
}

const dealsData: DealData[] = [
  {
    title: 'Deals of the day',
    items: [
      { img: IMAGES.Deal_1, name: 'Cabinetry' },
      { img: IMAGES.Deal_2, name: 'Door Frames' },
      { img: IMAGES.Deal_3, name: 'Flooring' },
      { img: IMAGES.Deal_4, name: 'Carpets' },
    ],
  },
  {
    title: 'Bulk building supplies',
    items: [
      { img: IMAGES.Deal_5, name: 'Ceiling Fans' },
      { img: IMAGES.Deal_6, name: 'Light Fixtures' },
      { img: IMAGES.Deal_7, name: 'Generators' },
      { img: IMAGES.Deal_8, name: 'Power Tools' },
    ],
  },
  {
    title: 'Products We Deliver',
    items: [
      { img: IMAGES.Deal_9, name: 'Steel Beams & Co...' },
      { img: IMAGES.Deal_10, name: 'Roofing & Insulation' },
      { img: IMAGES.Deal_11, name: 'Security Grilles' },
      { img: IMAGES.Deal_12, name: 'Wall Panels' },
    ],
  },
];

const SmallCardComponent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full  mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {dealsData.map((deal, index) => (
            <Card
              key={index}
              className="shadow-sm sm:shadow-lg hover:shadow-xl transition-shadow duration-300 border-gray-100 p-0"
            >
              <CardContent className="p-4 sm:p-5 md:p-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                  {deal.title}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-6">
                  {deal.items.map((item, idx) => (
                    <div key={idx} className=" ">
                      <div
                        onClick={() => navigate('/marketplace')}
                        className="cursor-pointer rounded-lg relative  transition-colors duration-200"
                      >
                        <div
                          className="absolute inset-0 rounded-md"
                          style={{
                            background:
                              'linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)',
                          }}
                        />
                        <div className="aspect-square mb-2 sm:mb-3 overflow-hidden rounded-md">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <h3 className="text-xs sm:text-sm font-medium text-center transition-colors duration-200 absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 text-white">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to={'/marketplace'}
                  className="w-full text-primary underline font-semibold transition-colors duration-200"
                >
                  Explore All
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmallCardComponent;
