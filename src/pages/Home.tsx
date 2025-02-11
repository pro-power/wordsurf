import React, { useEffect, useRef, useState } from 'react';
import { Input } from "src/components/ui/input";
import { Card, CardContent } from "src/components/ui/card";
import { Trophy, Crown, Medal } from 'lucide-react';
import Navigation from 'src/components/ui/Navigation';
import leaderboardService from 'src/services/leaderboardService';


const HomePage = () => {
  const leaderboardRef = useRef(null);
  const howToPlayRef = useRef(null);

  const [leaderboardData, setLeaderboardData] = useState([
    { id: '1', name: "Alex", score: 2500, icon: <Crown className="w-6 h-6 text-yellow-500" /> },
    { id: '2', name: "Sarah", score: 2200, icon: <Trophy className="w-6 h-6 text-gray-400" /> },
    { id: '3', name: "Michael", score: 2100, icon: <Medal className="w-6 h-6 text-amber-700" /> },
    { id: '4', name: "Emily", score: 1950 },
    { id: '5', name: "David", score: 1800 },
  ]);

  // Fetch leaderboard data from the service on component mount and after new score submission
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const topScores = await leaderboardService.getTopScores();
      setLeaderboardData(topScores);
    };

    fetchLeaderboard();
  }, []);  // Empty dependency array ensures it runs once on mount


  return (
    <div className="bg-gray-50">
      <Navigation />
      {/* Hero Section */}
      <section className="min-h-[calc(100vh-4rem)] pt-20 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-6xl font-bold text-blue-500">WordWave</h1>
            <p className="text-gray-600 mt-2">Connect words, build chains, score points!</p>
          </div>
{/* 
          <Card className="w-full max-w-lg mx-auto">
            <CardContent className="pt-6">
              <Input 
                placeholder="Search for a word..."
                className="text-lg"
              />
            </CardContent>
          </Card> */}
        </div>
      </section>

      {/* Leaderboard Section */}
      {/* Update the leaderboard section to use the state */}
      <section 
        ref={leaderboardRef} 
        className="py-20 bg-white"
        id="leaderboard"
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Global Leaderboard</h2>
          <div className="grid gap-4">
            {leaderboardData.slice().sort((a,b) => b.score - a.score).map((entry, index) => (
              <Card key={entry.id} className="transform hover:scale-102 transition-transform">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                      {entry.icon || (
                        <span className="text-xl font-bold text-blue-500">#{entry.id}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{entry.name}</h3>
                      <p className="text-gray-500 text-sm">Rank #{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">{entry.score}</span>
                    <p className="text-gray-500 text-sm">points</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section 
        ref={howToPlayRef} 
        className="py-20 bg-gray-50"
        id="how-to-play"
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How to Play</h2>
          <div className="grid gap-8">
            {/* Game Rules */}
            <Card className="overflow-hidden">
              <div className="bg-blue-500 p-4">
                <h3 className="text-xl font-bold text-white">Game Rules</h3>
              </div>
              <CardContent className="p-6">
                <ol className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Start with the Word of the Day</h4>
                      <p className="text-gray-600">Begin your chain with our specially selected daily word</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Connect Words</h4>
                      <p className="text-gray-600">Enter words that begin with the last letter of the previous word</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Beat the Clock</h4>
                      <p className="text-gray-600">Complete as many valid words as possible within 60 seconds</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
            
            {/* Scoring System */}
            <Card className="overflow-hidden">
              <div className="bg-green-500 p-4">
                <h3 className="text-xl font-bold text-white">Scoring System</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <span className="font-bold text-green-600">10×</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Base Points</h4>
                      <p className="text-gray-600">Each letter in your word multiplies your base score by 10</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h4 className="font-bold mb-4">Bonus Points</h4>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-lg">
                        <span className="text-yellow-600 font-bold">+50</span>
                        <span>Words longer than 8 letters</span>
                      </div>
                      <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-lg">
                        <span className="text-purple-600 font-bold">+20</span>
                        <span>Words starting with a vowel</span>
                      </div>
                      <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg">
                        <span className="text-blue-600 font-bold">+30</span>
                        <span>Words with no repeating letters</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;