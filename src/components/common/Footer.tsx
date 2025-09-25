import React from 'react';

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
        <p className="leading-[1.3] whitespace-pre-wrap">
          <span className="inline-block hover:text-primary">Contact Us</span>
          <span className="hidden md:inline"> | </span>
          <span className="md:hidden"> | </span>
          <span className="inline-block hover:text-primary">Terms and Conditions</span>
          <span className="hidden md:inline"> | </span>
          <span className="md:hidden"> | </span>
          <span className="inline-block hover:text-primary">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};
