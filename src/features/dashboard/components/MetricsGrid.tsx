import React from 'react';
import { MetricCard } from './MetricCard';
import { MetricData } from '../types';

interface MetricsGridProps {
  metrics: MetricData[];
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, className }) => {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};
