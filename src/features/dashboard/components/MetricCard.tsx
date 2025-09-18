import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { MetricData } from '../types';

interface MetricCardProps extends MetricData {}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}) => {
  return (
    <Card className={`relative overflow-hidden border-0 ${color} sm:h-[127px] h-[100px] rounded-4xl`}>
      <CardContent className="p-0">
        <div className="absolute left-5 top-[20px] z-10 sm:top-[30px] ">
          <div className="text-white">
            <div className="sm:text-[38px] text-[24px] font-bold leading-[46px]">{value}</div>
            <div className="sm:text-[18px] text-[14px]">{title}</div>
          </div>
        </div>
        <div className="absolute -right-2 -bottom-2">
          <div className={`${bgColor} sm:size-24 size-14 rounded-full flex items-center justify-center`}>
            <Icon className="size-6 sm:size-10 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
