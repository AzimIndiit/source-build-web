import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const HomeFooter: React.FC<{ className?: string }> = ({ className }) => {
  const { isAuthenticated, user } = useAuth();
  return (
    <footer className={cn('bg-primary text-white py-6 px-4 sm:px-6 lg:px-8', className)}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
        {/* Copyright */}
        <div className="text-sm">© Copyright 2025. Source Build. All Rights Reserved.</div>

        {/* Registration Links */}
        {!isAuthenticated && (
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/auth/signup"
              className="underline hover:text-gray-200 transition-colors duration-200"
            >
              Register as a vendor
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/auth/signup"
              className="underline hover:text-gray-200 transition-colors duration-200"
            >
              Register as a Driver
            </Link>
          </div>
        )}

        {/* Contact and Policy Links */}
        {user?.role !== 'admin' && (
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/contact-us"
              className={cn('hover:text-gray-200 transition-colors duration-200', className)}
            >
              Contact Us
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/terms"
              className={cn('hover:text-gray-200 transition-colors duration-200', className)}
            >
              Terms and Conditions
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/privacy"
              className={cn('hover:text-gray-200 transition-colors duration-200', className)}
            >
              Privacy Policy
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
};

export default HomeFooter;
