import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Unauthorized</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          You don't have permission to access this page.
        </p>
        <Button asChild className="text-white hover:text-white">
          {user?.role == 'buyer' ? (
            <Link to={`/`}>Go to Home</Link>
          ) : (
            <Link to={`/${user?.role}/dashboard`}>Go to Dashboard</Link>
          )}
        </Button>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
