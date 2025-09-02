import React, { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Slide {
  image: string;
  delivery: string;
  price: string;
  description: string;
  location: string;
  seller: string;
}

interface CustomArrowProps {
  onClick?: () => void;
}

interface MultiSliderSliderProps {
  slides: Slide[];
}

const CustomPrevArrow: React.FC<CustomArrowProps> = ({ onClick }) => (
  <div
    className="absolute left-0 top-1/2 z-20 -translate-y-1/2 cursor-pointer bg-white/90 hover:bg-white h-8 sm:h-10 md:h-12 lg:h-14 rounded-e-lg sm:rounded-e-xl md:rounded-e-2xl flex justify-center items-center p-1 sm:p-1.5 md:p-2 shadow-md hover:shadow-lg transition-all duration-300"
    onClick={onClick}
  >
    <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-700" />
  </div>
);

const CustomNextArrow: React.FC<CustomArrowProps> = ({ onClick }) => (
  <div
    className="absolute right-0 h-8 sm:h-10 md:h-12 lg:h-14 top-1/2 z-20 -translate-y-1/2 cursor-pointer flex justify-center items-center rounded-s-lg sm:rounded-s-xl md:rounded-s-2xl bg-white/90 hover:bg-white p-1 sm:p-1.5 md:p-2 shadow-md hover:shadow-lg transition-all duration-300"
    onClick={onClick}
  >
    <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-700" />
  </div>
);

const MultiSliderSlider: React.FC<MultiSliderSliderProps> = ({ slides }) => {
  const navigate = useNavigate();
  const [likedSlides, setLikedSlides] = useState<Record<number, boolean>>({});

  const toggleLike = (index: number) => {
    setLikedSlides((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const customSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5.2,
    slidesToScroll: 1,
    swipeToSlide: true,
    touchThreshold: 10,
    centerMode: false,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 4.2,
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3.5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3.2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.5,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2.2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1.3,
          centerMode: false,
        },
      },
      {
        breakpoint: 390,
        settings: {
          slidesToShow: 1.15,
          centerMode: false,
        },
      },
    ],
  };

  return (
    <section className={`relative w-full overflow-hidden ${slides.length === 1 ? 'max-w-md mx-auto' : ''}`}>
      <Slider {...customSettings} className="px-2 sm:px-0">
        {slides.map((slide, index) => (
          <div className="pr-1.5 sm:pr-2 md:pr-3 lg:pr-4" key={index}>
            <div className="rounded-sm sm:rounded-lg overflow-hidden duration-300 bg-white">
              <div className="relative">
                <div
                  onClick={() => navigate('/product-details')}
                  className="relative h-28 sm:h-36 md:h-44 lg:h-48 bg-cover bg-center cursor-pointer group"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-200" />
                  <h3 className="absolute bottom-1 sm:bottom-2 md:bottom-3 left-1 sm:left-2 md:left-3 text-white font-semibold text-[10px] sm:text-xs md:text-sm bg-black/50 px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded text-nowrap overflow-hidden text-ellipsis max-w-[90%]">
                    {slide.delivery}
                  </h3>
                </div>
                <div
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleLike(index);
                  }}
                >
                  <motion.div
                    animate={{ scale: likedSlides[index] ? [1, 1.4, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 ${
                        likedSlides[index] ? 'fill-red-500 text-red-500' : 'fill-white text-white'
                      } drop-shadow-lg`}
                    />
                  </motion.div>
                </div>
              </div>

              <div className="p-1.5 sm:p-2 md:p-3 lg:p-4">
                <h2
                  onClick={() => navigate('/product')}
                  className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 cursor-pointer hover:text-primary transition-colors duration-200 mb-1"
                >
                  ${slide.price}
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 mb-1.5 sm:mb-2 md:mb-3 line-clamp-2">
                  {slide.description}
                </p>
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-xs text-gray-500">
                  <span className="flex items-center gap-0.5 truncate max-w-[60%]">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                    <span className="truncate">{slide.location}</span>
                  </span>
                  <span className="truncate max-w-[40%] text-right">{slide.seller}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default MultiSliderSlider;
