import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Clock
} from 'lucide-react';
import { MetricData, SalesData, RevenueData, Order } from '../types';

export const metricsData: MetricData[] = [
  {
    title: 'Total Listings',
    value: '106',
    color: 'bg-[#2b5aac]',
    icon: Package,
    bgColor: 'bg-white/20'
  },
  {
    title: 'Out of Stock',
    value: '24',
    color: 'bg-[#da1010]',
    icon: AlertTriangle,
    bgColor: 'bg-white/20'
  },
  {
    title: 'Total Orders',
    value: '1082',
    color: 'bg-[#269210]',
    icon: ShoppingCart,
    bgColor: 'bg-white/20'
  },
  {
    title: 'Pending Orders',
    value: '12',
    color: 'bg-[#e68814]',
    icon: Clock,
    bgColor: 'bg-white/20'
  }
];

export const weekSalesData: SalesData[] = [
  { day: 'Mon', sales: 200 },
  { day: 'Tue', sales: 450 },
  { day: 'Wed', sales: 350 },
  { day: 'Thu', sales: 400 },
  { day: 'Fri', sales: 600 },
  { day: 'Sat', sales: 420 },
  { day: 'Sun', sales: 480 },
];

export const revenueData: RevenueData[] = [
  { month: 'Jan', revenue: 15000 },
  { month: 'Feb', revenue: 18000 },
  { month: 'Mar', revenue: 16000 },
  { month: 'Apr', revenue: 20000 },
  { month: 'May', revenue: 22000 },
  { month: 'Jun', revenue: 25000 },
  { month: 'Jul', revenue: 28000 },
  { month: 'Aug', revenue: 26000 },
  { month: 'Sep', revenue: 30000 },
  { month: 'Oct', revenue: 32000 },
  { month: 'Nov', revenue: 29000 },
  { month: 'Dec', revenue: 33042 },
];

export const ordersData: Order[] = [
  {
    id: '#671256',
    product: 'Primed 4" Baseboards 16',
    customer: { 
      name: 'Ethan Popa', 
      email: 'ethan12@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    date: 'Jan 6, 2009',
    amount: '$887',
    status: 'Delivered'
  },
  {
    id: '#891256',
    product: 'Primed MDF 3.25" Casing',
    customer: { 
      name: 'Ashley Jackson', 
      email: 'jackson89@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    date: 'Feb 13, 2013',
    amount: '$527',
    status: 'Processing'
  },
  {
    id: '#891256',
    product: 'Primed MDF 3.25" Casing',
    customer: { 
      name: 'Aya Rossi', 
      email: 'eayariossi@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=10'
    },
    date: 'Jul 28, 2022',
    amount: '$577',
    status: 'Pending'
  },
  {
    id: '#891256',
    product: 'Primed MDF 3.25" Casing',
    customer: { 
      name: 'Mehdi Keita', 
      email: 'mehdi67@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=8'
    },
    date: 'May 2, 2010',
    amount: '$820',
    status: 'Pending'
  },
  {
    id: '#891256',
    product: 'Primed MDF 3.25" Casing',
    customer: { 
      name: 'Bạc Khương Đạo', 
      email: 'backuh@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=7'
    },
    date: 'Jun 16, 2021',
    amount: '$126',
    status: 'Delivered'
  },
  {
    id: '#891256',
    product: 'Primed MDF 3.25" Casing',
    customer: { 
      name: 'Luis López', 
      email: 'luislop@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=11'
    },
    date: 'Jul 23, 2019',
    amount: '$716',
    status: 'Pending'
  },
  {
    id: '#891256',
    product: 'Primed MDF 3.25" Casing',
    customer: { 
      name: 'Luis González', 
      email: 'gonzale77@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    date: 'Apr 27, 2018',
    amount: '$207',
    status: 'Processing'
  },
  {
    id: '#891256',
    product: 'Primed MDF 3.25" Casing',
    customer: { 
      name: 'Gabriela González', 
      email: 'gabriela76@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=9'
    },
    date: 'Sep 22, 2015',
    amount: '$692',
    status: 'Delivered'
  },
  {
    id: '#891256',
    product: 'Primed MDF 3.25" Casing',
    customer: { 
      name: 'Cayadi Megantara', 
      email: 'cayandi56@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=15'
    },
    date: 'Jul 12, 2023',
    amount: '$237',
    status: 'Cancelled'
  },
  {
    id: '#891256',
    product: 'Primed MDF 3.25" Casing',
    customer: { 
      name: 'Sara Adimbola', 
      email: 'saraadmen77@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=16'
    },
    date: 'Mar 20, 2020',
    amount: '$548',
    status: 'Delivered'
  }
];