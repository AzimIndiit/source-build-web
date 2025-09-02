import { Link } from 'react-router-dom';

const HomeFooter: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <div className="text-sm">© Copyright 2025. Source Build. All Rights Reserved.</div>

        {/* Registration Links */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/register-vendor"
            className="underline hover:text-gray-200 transition-colors duration-200"
          >
            Register as a vendor
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            to="/sign-up"
            className="underline hover:text-gray-200 transition-colors duration-200"
          >
            Register as a Driver
          </Link>
        </div>

        {/* Contact and Policy Links */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/contact-us" className="hover:text-gray-200 transition-colors duration-200">
            Contact Us
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            to="/terms-and-conditions"
            className="hover:text-gray-200 transition-colors duration-200"
          >
            Terms and Conditions
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/privacy-policy" className="hover:text-gray-200 transition-colors duration-200">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
