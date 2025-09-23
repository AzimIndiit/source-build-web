import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItemType {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbWrapperProps {
  items: BreadcrumbItemType[];
  className?: string;
}

export const BreadcrumbWrapper: React.FC<BreadcrumbWrapperProps> = ({ items, className = '' }) => {
  return (
    <div className={`py-4 ${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.isCurrentPage ? (
                  <BreadcrumbPage className="text-primary text-base capitalize">
                    {item.label}
                  </BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink asChild className="text-base capitalize">
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-gray-500 text-base capitalize">{item.label}</span>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbWrapper;
