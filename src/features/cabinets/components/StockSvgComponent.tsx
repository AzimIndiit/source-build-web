import React from 'react';

interface StockSvgComponentProps {
  color: string;
  className?: string;
}

const StockSvgComponent: React.FC<StockSvgComponentProps> = ({ color, className = '' }) => {
  return (
    <svg
      width="24"
      className={className}
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.85059 16L11.3506 17.5L14.6006 14.5"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9.04041 2L5.42041 5.63"
        stroke={color}
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.4204 2L19.0404 5.63"
        stroke={color}
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M2.23047 7.8501C2.23047 6.0001 3.22047 5.8501 4.45047 5.8501H20.0105C21.2405 5.8501 22.2305 6.0001 22.2305 7.8501C22.2305 10.0001 21.2405 9.8501 20.0105 9.8501H4.45047C3.22047 9.8501 2.23047 10.0001 2.23047 7.8501Z"
        stroke={color}
        stroke-width="1.5"
      />
      <path
        d="M3.73047 10L5.14047 18.64C5.46047 20.58 6.23047 22 9.09047 22H15.1205C18.2305 22 18.6905 20.64 19.0505 18.76L20.7305 10"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default StockSvgComponent;
