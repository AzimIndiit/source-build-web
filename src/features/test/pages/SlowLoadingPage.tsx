import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// This component is used to test the Suspense loader
// The delay is added via withDelay() in the router configuration
const SlowLoadingPage = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Loader Page - Loaded via withDelay!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">✅ The Suspense loader worked with lazy import delay!</p>
          <p className="text-gray-600">
            This page was delayed by 3 seconds using the <code className="bg-gray-100 px-1 rounded">withDelay()</code> utility.
          </p>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Success!</h3>
            <p className="text-sm text-green-800">
              If you saw the red background loader before this page appeared, the lazy loading delay is working correctly.
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How this works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>The router uses <code className="bg-blue-100 px-1 rounded">lazy(() =&gt; withDelay(import(...), 3000))</code></li>
              <li>This delays the module import by 3 seconds</li>
              <li>During the delay, React Suspense shows the fallback loader</li>
              <li>After 3 seconds, this component loads and renders</li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Testing other routes:</h3>
            <p className="text-sm text-gray-700 mb-2">
              You can add delays to any route by wrapping the import with <code className="bg-gray-100 px-1 rounded">withDelay()</code>:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`lazy: () => withDelay(
  import('@/features/page').then(m => ({
    Component: m.default
  })),
  3000 // delay in milliseconds
)`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SlowLoadingPage;