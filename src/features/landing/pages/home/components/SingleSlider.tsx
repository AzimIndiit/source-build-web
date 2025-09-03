import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactElement } from 'react';
import { Button } from '@/components/ui';

interface Slide {
  image: string;
  title: React.ReactNode;
  description: string;
}

interface CustomArrowProps {
  onClick?: () => void;
}

interface CustomSliderProps {
  slides: Slide[];
}

const CustomPrevArrow: React.FC<CustomArrowProps> = ({ onClick }) => (
  <div
    className="absolute left-2 sm:left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-2 sm:p-3 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl"
    onClick={onClick}
  >
    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
  </div>
);

const CustomNextArrow: React.FC<CustomArrowProps> = ({ onClick }) => (
  <div
    className="absolute right-2 sm:right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-2 sm:p-3 shadow-lg transition-all duration-300 hover:bg-white hover:shadow-xl"
    onClick={onClick}
  >
    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
  </div>
);

const CustomSlider: React.FC<CustomSliderProps> = ({ slides }) => {
  const customSettings = {
    dots: false,
    infinite: false,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  return (
    <section className="relative w-full">
      <Slider {...customSettings}>
        {slides.map((slide, index) => (
          <div
            className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[750px] w-full"
            key={index}
          >
            <img src={slide.image} alt="Slider image" className="h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)',
              }}
            />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
                <div className="max-w-4xl  px-12 sm:px-12 lg:px-0">
                  <div className="space-y-3 sm:space-y-4 md:space-y-6 text-white">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl">
                      {slide.description}
                    </p>
                    <div className="flex gap-4 flex-row">
                      <Button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-white transition-all duration-300 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2  h-10 sm:h-[69px]">
                        Shop cabinets
                      </Button>
                      <Button className="bg-white text-gray-800 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2   h-10 sm:h-[69px]">
                        Get a design
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default CustomSlider;
