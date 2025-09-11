import React from 'react';

interface CardIconProps {
  className?: string;
}

export const VisaIcon: React.FC<CardIconProps> = ({ className = 'w-8 h-5' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#1A1F71" />
    <path d="M20.5 21H17.5L19.5 11H22.5L20.5 21Z" fill="white" />
    <path
      d="M31.5 11.5L29 18L27.5 11.5C27.3 11.2 27 11 26.5 11H23.5L27.5 21H30.5L35 11H31.5Z"
      fill="white"
    />
    <path
      d="M16 11H13L9 21H12.5L13 19H16L16.5 21H20L16.5 11H16ZM13.5 17L14.5 13.5L15.5 17H13.5Z"
      fill="white"
    />
    <path
      d="M37 11C36 11 35.5 11.5 35.5 11.5L33 21H36L36.5 19C36.5 19 37 19.5 38 19.5C40 19.5 42 18 42 15C42 12.5 40 11 37 11Z"
      fill="white"
    />
  </svg>
);

export const MastercardIcon: React.FC<CardIconProps> = ({ className = 'w-8 h-5' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#EB001B" />
    <circle cx="19" cy="16" r="10" fill="#FF5F00" />
    <circle cx="29" cy="16" r="10" fill="#F79E1B" />
    <path
      d="M24 8C21.5 10 20 13 20 16C20 19 21.5 22 24 24C26.5 22 28 19 28 16C28 13 26.5 10 24 8Z"
      fill="#EB001B"
    />
  </svg>
);

export const AmexIcon: React.FC<CardIconProps> = ({ className = 'w-8 h-5' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#006FCF" />
    <path d="M12 18L10 13H8L6 18V13H4V19H7L9 14.5L11 19H14V13H12V18Z" fill="white" />
    <path d="M16 13V19H22V17H18V16.5H21.5V15H18V14.5H22V13H16Z" fill="white" />
    <path d="M26 16L24 13H22V19H24V16L26 19H28V13H26V16Z" fill="white" />
    <path
      d="M32 14.5L30 13H28L30.5 16L28 19H30L32 17.5L34 19H36L33.5 16L36 13H34L32 14.5Z"
      fill="white"
    />
    <path d="M38 13H36V19H42V17H38V13Z" fill="white" />
  </svg>
);

export const DiscoverIcon: React.FC<CardIconProps> = ({ className = 'w-8 h-5' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#FF6000" />
    <circle cx="24" cy="16" r="8" fill="#FFFFFF" />
    <path
      d="M8 19H10C12 19 13 18 13 16C13 14 12 13 10 13H8V19ZM10 15C10.5 15 11 15.5 11 16C11 16.5 10.5 17 10 17H10V15Z"
      fill="white"
    />
    <path d="M14 13V19H16V13H14Z" fill="white" />
    <path
      d="M17 17C17 18 18 19 19.5 19C21 19 22 18.5 22 17.5C22 16.5 21.5 16 20.5 16C19.5 16 19 15.5 19 15C19 14.5 19.5 14 20.5 14C21.5 14 22 14.5 22 15H21C21 14.5 20.5 14 20 14C19 14 18 14.5 18 15.5C18 16.5 18.5 17 19.5 17C20.5 17 21 17.5 21 18C21 18.5 20.5 19 19.5 19C18.5 19 18 18.5 18 18H17Z"
      fill="white"
    />
  </svg>
);

export const RupayIcon: React.FC<CardIconProps> = ({ className = 'w-8 h-5' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E0E0E0" />
    <path
      d="M10 10L14 16L10 22"
      stroke="#097C44"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 10L18 16L14 22"
      stroke="#F47721"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text
      x="22"
      y="20"
      fontSize="10"
      fill="#1D4F91"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      RuPay
    </text>
  </svg>
);

export const JcbIcon: React.FC<CardIconProps> = ({ className = 'w-8 h-5' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#0E4C96" />
    <rect x="8" y="8" width="10" height="16" rx="2" fill="#FFFFFF" />
    <rect x="19" y="8" width="10" height="16" rx="2" fill="#FF0000" />
    <rect x="30" y="8" width="10" height="16" rx="2" fill="#00A650" />
    <text
      x="10"
      y="18"
      fontSize="8"
      fill="#0E4C96"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      J
    </text>
    <text
      x="21"
      y="18"
      fontSize="8"
      fill="#FFFFFF"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      C
    </text>
    <text
      x="32"
      y="18"
      fontSize="8"
      fill="#FFFFFF"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      B
    </text>
  </svg>
);

export const UnionPayIcon: React.FC<CardIconProps> = ({ className = 'w-8 h-5' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#005BAC" />
    <rect x="15" y="8" width="8" height="16" fill="#E60012" />
    <rect x="25" y="8" width="8" height="16" fill="#FFFFFF" />
    <text x="4" y="20" fontSize="6" fill="#FFFFFF" fontFamily="Arial, sans-serif">
      UnionPay
    </text>
  </svg>
);

export const MaestroIcon: React.FC<CardIconProps> = ({ className = 'w-8 h-5' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E0E0E0" />
    <circle cx="19" cy="16" r="8" fill="#EB001B" />
    <circle cx="29" cy="16" r="8" fill="#0099DF" />
    <path
      d="M24 10C22 11.5 20.5 13.5 20.5 16C20.5 18.5 22 20.5 24 22C26 20.5 27.5 18.5 27.5 16C27.5 13.5 26 11.5 24 10Z"
      fill="#6C6BBD"
    />
  </svg>
);

export const DinersIcon: React.FC<CardIconProps> = ({ className = 'w-8 h-5' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#0079BE" />
    <circle cx="24" cy="16" r="10" fill="#FFFFFF" />
    <circle cx="19" cy="16" r="7" fill="#0079BE" />
    <circle cx="29" cy="16" r="7" fill="#0079BE" />
    <rect x="19" y="9" width="10" height="14" fill="#FFFFFF" />
  </svg>
);

export const DefaultCardIcon: React.FC<CardIconProps> = ({ className = 'w-8 h-5' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#E0E0E0" />
    <rect x="8" y="10" width="20" height="3" fill="#9E9E9E" />
    <rect x="8" y="15" width="15" height="2" fill="#9E9E9E" />
    <rect x="8" y="19" width="10" height="2" fill="#9E9E9E" />
    <rect x="32" y="10" width="8" height="8" rx="1" fill="#9E9E9E" />
  </svg>
);

interface CardBrandIconProps {
  cardType: string;
  className?: string;
}

export const CardBrandIcon: React.FC<CardBrandIconProps> = ({ cardType, className }) => {
  switch (cardType.toLowerCase()) {
    case 'visa':
      return <VisaIcon className={className} />;
    case 'mastercard':
      return <MastercardIcon className={className} />;
    case 'amex':
      return <AmexIcon className={className} />;
    case 'discover':
      return <DiscoverIcon className={className} />;
    case 'rupay':
      return <RupayIcon className={className} />;
    case 'jcb':
      return <JcbIcon className={className} />;
    case 'unionpay':
      return <UnionPayIcon className={className} />;
    case 'maestro':
      return <MaestroIcon className={className} />;
    case 'diners':
      return <DinersIcon className={className} />;
    default:
      return <DefaultCardIcon className={className} />;
  }
};
