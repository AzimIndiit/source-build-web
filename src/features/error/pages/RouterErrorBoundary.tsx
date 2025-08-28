import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft, Bug, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const RouterErrorBoundary: React.FC = () => {
  const error = useRouteError() as Error | Response | null;
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  let errorType: 'notFound' | 'auth' | 'server' | 'network' | 'unknown' = 'unknown';
  let errorMessage = 'An unexpected error occurred';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      errorType = 'notFound';
      errorMessage = 'Page not found';
    } else if (error.status === 401 || error.status === 403) {
      errorType = 'auth';
      errorMessage = error.status === 401 ? 'Unauthorized' : 'Forbidden';
    } else if (error.status >= 500) {
      errorType = 'server';
      errorMessage = 'Server error';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      errorType = 'network';
    }
  }

  const errorConfigs = {
    notFound: {
      icon: AlertTriangle,
      title: 'Page Not Found',
      message: "The page you're looking for doesn't exist.",
      description: 'Check the URL or navigate to a different page.',
    },
    auth: {
      icon: Shield,
      title: 'Authentication Error',
      message: "You don't have permission to access this resource.",
      description: 'Please log in or contact support if you believe this is an error.',
    },
    server: {
      icon: Bug,
      title: 'Server Error',
      message: 'Something went wrong on our end.',
      description: "We're working to fix this issue. Please try again later.",
    },
    network: {
      icon: Zap,
      title: 'Network Error',
      message: 'Unable to connect to the server.',
      description: 'Please check your internet connection and try again.',
    },
    unknown: {
      icon: AlertTriangle,
      title: 'Something Went Wrong',
      message: errorMessage,
      description: 'Please try refreshing the page or contact support if the problem persists.',
    },
  };

  const config = errorConfigs[errorType];
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-gray-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <IconComponent className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 font-medium">{config.message}</p>
          <p className="text-sm text-gray-500">{config.description}</p>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-600 overflow-auto max-h-32">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(
                    error instanceof Error ? { message: error.message, stack: error.stack } : error,
                    null,
                    2
                  )}
                </pre>
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex-1 border-gray-200 text-gray-500 hover:text-gray-500 hover:bg-gray-50   "
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={handleGoHome} className="flex-1 text-white hover:text-white">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
