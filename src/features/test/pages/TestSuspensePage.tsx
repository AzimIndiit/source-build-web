import SuspenseLoader from '@/components/common/SuspenseLoader';
import { useState, useEffect } from 'react';

const TestSuspensePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // This throws a promise during loading, which triggers Suspense
  if (loading) {
    throw new Promise(() => {});
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Page Loaded!</h1>
      <p className="mt-4">If you saw the red background loader, Suspense is working!</p>
    </div>
  );
};

export default TestSuspensePage;