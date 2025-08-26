import React from 'react';
import {
  ClipboardCheck,
  XCircle,
  Megaphone,
  Package,
  PackageX,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { NotificationType } from '../types';

export interface IconConfig {
  iconColor: string;
  bgColor: string;
}

export const getNotificationIcon = (type: NotificationType): IconConfig => {
  switch (type) {
    case 'NEW_ORDER':
      return {
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    case 'ORDER_CANCELLED':
      return {
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    case 'ORDER_CONFIRMED':
      return {
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    case 'ORDER_DELIVERED':
      return {
        iconColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      };
    case 'PRODUCT_OUT_OF_STOCK':
      return {
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    case 'PRODUCT_APPROVED':
      return {
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    case 'PRODUCT_PRICE_UPDATE':
      return {
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    default:
      return {
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-50'
      };
  }
};

export const getNotificationIconComponent = (type: NotificationType): React.ComponentType<{ className?: string }> => {
  switch (type) {
    case 'NEW_ORDER':
      return ClipboardCheck;
    case 'ORDER_CANCELLED':
      return XCircle;
    case 'ORDER_CONFIRMED':
      return Megaphone;
    case 'ORDER_DELIVERED':
      return Package;
    case 'PRODUCT_OUT_OF_STOCK':
      return PackageX;
    case 'PRODUCT_APPROVED':
      return CheckCircle2;
    case 'PRODUCT_PRICE_UPDATE':
      return DollarSign;
    default:
      return Package;
  }
};
