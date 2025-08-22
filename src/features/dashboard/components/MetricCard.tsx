import React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/Card';
import { MetricData } from '../types';

interface MetricCardProps extends MetricData {}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, bgColor }) => {
  return (
    <Card className={`relative overflow-hidden border-0 ${color} h-[127px] rounded-4xl`}>
      <CardContent className="p-0">
        <div className="absolute left-5 top-[30px] z-10">
          <div className="text-white">
            <div className="text-[38px] font-bold leading-[46px]">{value}</div>
            <div className="text-[18px]">{title}</div>
          </div>
        </div>
        <div className="absolute -right-2 -bottom-2">
          <div className={`${bgColor} size-24 rounded-full flex items-center justify-center`}>
            <Icon className="size-10 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};