import React from 'react';

interface FooterProps {
  sidebarWidth?: string;
  isMobile?: boolean;
}

export const Footer: React.FC<FooterProps> = ({}) => {
  return (
    <div className="flex flex-col bg-[#f7f7f7]   min-h-[56px]  py-4 gap-4 md:flex-row items-center justify-between  text-black text-xs md:text-sm w-full px-4 md:px-12">
      <div className="text-center md:text-left">
        <p className="leading-[1.3]">© Copyright 2025. Source Build. All Rights Reserved.</p>
      </div>
      <div className="text-center md:text-right">
        <p className="leading-[1.3] whitespace-pre-wrap">
          <span className="inline-block">Contact Us</span>
          <span className="hidden md:inline"> l </span>
          <span className="md:hidden"> | </span>
          <span className="inline-block">Terms and Conditions</span>
          <span className="hidden md:inline"> l </span>
          <span className="md:hidden"> | </span>
          <span className="inline-block">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};
