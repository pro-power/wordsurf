import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'src/components/ui/button';
import Navigation from 'src/components/ui/Navigation';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              404
            </h1>
            <p className="text-2xl mt-4 text-gray-600">Looks like you've drifted off course!</p>
          </div>
          
          {/* Wave animation with boat */}
        
          
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 inline-block">
              <div className="flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                <p className="text-amber-800">This page seems to have drifted away</p>
              </div>
            </div>
            
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been moved to another location.
            </p>
            
            <div className="pt-4">
              <Link to="/">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg">
                  Return to Safe Harbor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;