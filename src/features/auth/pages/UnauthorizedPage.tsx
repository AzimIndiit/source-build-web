import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

 function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Unauthorized</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          You don't have permission to access this page.
        </p>
        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export default UnauthorizedPage;