import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Calendar, ChevronDownIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RevenueData } from '../../types';
import { CustomTooltip } from './CustomTooltip';

interface RevenueChartProps {
  data: RevenueData[];
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, selectedYear, onYearChange }) => {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(parseInt(selectedYear), 0, 1)
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      onYearChange(newDate.getFullYear().toString());
    }
  };
  return (
    <Card className="shadow-sm border-gray-50 relative rounded-4xl h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Revenue</CardTitle>
          <Popover >
            <PopoverTrigger asChild className='border border-gray-200 rounded-md'>
              <Button
                variant="outline"
                className={cn(
                  "w-[120px] h-8 text-xs justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-3 w-3" />
                {date ? format(date, 'yyyy') : <span>Pick year</span>}
                <ChevronDownIcon className="size-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white  shadow-2xl border border-gray-200" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                defaultMonth={date}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2b5aac" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2b5aac" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#2b5aac" 
              fillOpacity={1} 
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        {/* Current Month Tooltip */}
        <div className="absolute top-[120px] right-[100px] bg-gray-900 text-white px-2 py-1 rounded text-xs">
          <div className="text-[10px]">This Month</div>
          <div className="font-bold">$33,042</div>
          <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900"></div>
        </div>
      </CardContent>
    </Card>
  );
};