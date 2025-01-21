import React from 'react';
import Navigation from 'src/components/ui/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";

const Home: React.FC = () => {
  return(
      <div className="min-h-screen bg-gray-50">
    <Navigation />
    <main className="pt-20 p-4">
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center flex-wrap gap-4"></CardTitle>
        </CardHeader>
        </Card>
</main>
</div>
)
};
export default Home;
