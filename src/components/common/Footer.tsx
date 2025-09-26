import { cn } from '@/lib/utils';
import React from 'react';
import { Link } from 'react-router';

interface FooterProps {
  sidebarWidth?: string;
  isMobile?: boolean;
}

export const Footer: React.FC<FooterProps> = ({}) => {
  return (
    <div className="flex flex-col bg-[#f7f7f7] mt-4   min-h-[56px]  py-4 gap-4 md:flex-row items-center justify-between  text-black text-xs md:text-sm w-full px-4 md:px-12">
      <div className="text-center lg:text-left">
        <p className="leading-[1.3]">© Copyright 2025. Source Build. All Rights Reserved.</p>
      </div>
      <div className="text-center lg:text-right">
      <div className="flex items-center gap-2 text-sm">
          <Link
            to="/contact-us"
            className={cn('hover:text-primary transition-colors duration-200')}
          >
            Contact Us
          </Link>
          <span className="text-gray-300">|</span>
            <Link
              to="/terms"
              className={cn('hover:text-primary transition-colors duration-200')}
            >
              Terms and Conditions
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/privacy"
              className={cn('hover:text-primary transition-colors duration-200')}
            >
              Privacy Policy
            </Link>
        </div>
      </div>
    </div>
  );
};
