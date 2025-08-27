import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { PaymentHistoryTable } from '../components/PaymentHistoryTable';

const mockPaymentHistory = [
  {
    orderId: '#671256',
    customer: {
      name: 'Ethan Popa',
      email: 'ethan12@gmail.com',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    transactionId: 'T21245I236652136',
    date: 'Jan 6, 2009',
    amount: '+$887',
    paymentMethod: 'Debit Card',
    isPositive: true,
  },
  {
    orderId: '#891256',
    customer: {
      name: 'Ashley Jackson',
      email: 'jackson89@gmail.com',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    transactionId: 'T21245I236652136',
    date: 'Feb 13, 2013',
    amount: '-$527',
    paymentMethod: 'Credit Card',
    isPositive: false,
  },
  {
    orderId: '#891256',
    customer: {
      name: 'Aya Rossi',
      email: 'eayariossi@gmail.com',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    },
    transactionId: 'T21245I236652136',
    date: 'Jul 28, 2022',
    amount: '+$577',
    paymentMethod: 'Debit Card',
    isPositive: true,
  },
  {
    orderId: '#891256',
    customer: {
      name: 'Mehdi Keita',
      email: 'mehdi67@gmail.com',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    },
    transactionId: 'T21245I236652136',
    date: 'May 2, 2010',
    amount: '+$820',
    paymentMethod: 'Debit Card',
    isPositive: true,
  },
  {
    orderId: '#891256',
    customer: {
      name: 'Bao Khuong Dao',
      email: 'backuh12@gmail.com',
      avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    },
    transactionId: 'T21245I236652136',
    date: 'Jun 16, 2021',
    amount: '+$126',
    paymentMethod: 'Debit Card',
    isPositive: true,
  },
  {
    orderId: '#891256',
    customer: {
      name: 'Luis López',
      email: 'luislop@gmail.com',
      avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    },
    transactionId: 'T21245I236652136',
    date: 'Jul 23, 2019',
    amount: '+$716',
    paymentMethod: 'Debit Card',
    isPositive: true,
  },
];

const MyEarningsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Earnings Summary Card */}
      <Card className="bg-primary text-white rounded-xl sm:rounded-2xl shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
            <div>
              <p className="text-white/80 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Today Earning
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">$ 10,652.26</p>
            </div>
            <Button className="w-full sm:w-auto bg-white text-primary px-4 sm:px-6 py-2 h-[40px] sm:h-[48px] rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base">
              Withdrawal Amount
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 pt-4 sm:pt-6 border-t border-white/20">
            <div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">350</p>
              <p className="text-white/80 text-xs sm:text-sm">Total Orders</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">06</p>
              <p className="text-white/80 text-xs sm:text-sm">Cancel Orders</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">$40</p>
              <p className="text-white/80 text-xs sm:text-sm">Pending Payouts</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">$450</p>
              <p className="text-white/80 text-xs sm:text-sm">Completed Payouts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <PaymentHistoryTable payments={mockPaymentHistory} />
    </div>
  );
};

export default MyEarningsPage;
