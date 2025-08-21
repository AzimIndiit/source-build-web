import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Link } from 'react-router-dom';
import { Car, Package2, Shield, Zap } from 'lucide-react';

 function HomePage() {
  return (
    <div>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-300 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Source Build
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            The ultimate platform connecting drivers and sellers. Streamline your business, 
            manage your fleet, and grow your sales all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Source Build?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Car className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Fleet Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Efficiently manage your vehicle fleet with real-time tracking and analytics.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Package2 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Product Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Showcase your products with a powerful catalog management system.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Enterprise-grade security to protect your data and transactions.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Stay connected with instant notifications and real-time order tracking.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of drivers and sellers who are already growing their business with Source Build.
          </p>
          <Button size="lg" asChild>
            <Link to="/auth/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;