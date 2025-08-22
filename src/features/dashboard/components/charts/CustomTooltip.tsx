import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-sm font-bold">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};