import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "src/components/ui/card";
import { Badge } from "src/components/ui/badge";
import Navigation from 'src/components/ui/Navigation';
import leaderboardService from 'src/services/leaderboardService';
import { wordService } from 'src/services/wordService';
import { Trophy, Crown, Medal, Star, Sparkles, BookOpen } from 'lucide-react';
import { Button } from "src/components/ui/button";
import { Link } from 'react-router-dom';

const getRankIcon = (index: number) => {
  if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />; // Gold (1st place)
  if (index === 1) return <Trophy className="w-6 h-6 text-gray-400" />; // Silver (2nd place)
  if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />; // Bronze (3rd place)
  return <Star className="w-6 h-6 text-blue-400" />; // Default icon for others
};

const HomePage = () => {
  const leaderboardRef = useRef(null);
  const howToPlayRef = useRef(null);
  
  const [wordOfTheDay, setWordOfTheDay] = useState("");
  const [wordDefinition, setWordDefinition] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [leaderboardData, setLeaderboardData] = useState([
    { id: '1', name: "Alex", score: 2500, icon: <Crown className="w-6 h-6 text-yellow-500" /> },
    { id: '2', name: "Sarah", score: 2200, icon: <Trophy className="w-6 h-6 text-gray-400" /> },
    { id: '3', name: "Michael", score: 2100, icon: <Medal className="w-6 h-6 text-amber-700" /> },
    { id: '4', name: "Emily", score: 1950 },
    { id: '5', name: "David", score: 1800 },
  ]);

  // Fetch leaderboard data and word of the day on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch leaderboard data
        const topScores = await leaderboardService.getTopScores();
        if(topScores.length > 0) {
          setLeaderboardData(topScores);
        }
        
        // Fetch word of the day and definition
        const wordData = await wordService.getWordOfTheDay();
        setWordOfTheDay(wordData.word);
        
        // Fetch definition if we have a word
        if(wordData.word) {
          const definition = await wordService.getWordDefinition(wordData.word);
          setWordDefinition(definition);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-7xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              WordSurf
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect words, build chains, challenge your vocabulary!
            </p>
            
            <div className="flex justify-center gap-4 pt-4">
              <Link to="/game">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  Play Now
                </Button>
              </Link>
              <a href="#how-to-play">
                <Button variant="outline" size="lg" className="border-blue-500 text-blue-700 hover:bg-blue-50">
                  How to Play
                </Button>
              </a>
            </div>
          </div>
          
          {/* Word of the Day Card */}
          <Card className="max-w-2xl mx-auto shadow-xl overflow-hidden border-0 bg-white">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <BookOpen className="w-5 h-5 mr-2" /> Word of the Day
              </h3>
            </div>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="animate-pulse flex flex-col space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ) : (
                <>
                  <h4 className="text-3xl font-bold text-center mb-4 text-blue-700">
                    {wordOfTheDay}
                  </h4>
                  <Badge className="mb-3 bg-blue-100 text-blue-800 hover:bg-blue-200">Today's Starting Word</Badge>
                  <p className="text-gray-600 italic">
                    {wordDefinition || "Start your word chain with this word today!"}
                  </p>
                  <div className="mt-4 text-sm text-gray-500 flex items-center">
                    <Sparkles className="w-4 h-4 mr-1 text-amber-500" />
                    <span>Hidden bonus word available today. Find it for extra points!</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section 
        ref={leaderboardRef} 
        className="py-20 bg-white"
        id="leaderboard"
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Global Leaderboard</h2>
          <p className="text-center text-gray-600 mb-12">Top players with the highest scores</p>
          
          <div className="grid gap-4">
            {leaderboardData.slice().sort((a,b) => b.score - a.score).map((entry, index) => (
              <Card key={entry.id} className="transform hover:scale-102 transition-transform border-0 shadow-md hover:shadow-lg">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 shadow-inner">
                      {entry.icon || (
                        <span className="text-xl font-bold">{getRankIcon(index)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" key={entry.id}>{(entry.name).toUpperCase()}</h3>
                      <p className="text-gray-500 text-sm">Rank #{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">{entry.score}</span>
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
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
        id="how-to-play"
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">How to Play</h2>
          <p className="text-center text-gray-600 mb-12">Master the art of word chains</p>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Game Rules */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <h3 className="text-xl font-bold text-white">Game Rules</h3>
              </div>
              <CardContent className="p-6">
                <ol className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
                      <span className="font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Start with the Word of the Day</h4>
                      <p className="text-gray-600">Begin your chain with our specially selected daily word</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
                      <span className="font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Connect Words</h4>
                      <p className="text-gray-600">Enter words that begin with the last letter of the previous word</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
                      <span className="font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Beat the Clock</h4>
                      <p className="text-gray-600">Complete as many valid words as possible within 60 seconds</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
                      <span className="font-bold text-blue-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Find the Bonus Word</h4>
                      <p className="text-gray-600">Discover the hidden bonus word related to the Word of the Day for extra points</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
            
            {/* Scoring System */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4">
                <h3 className="text-xl font-bold text-white">Scoring System</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center shadow-inner">
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
                      <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-lg shadow-sm">
                        <span className="text-yellow-600 font-bold">+50</span>
                        <span>Words longer than 8 letters</span>
                      </div>
                      <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-lg shadow-sm">
                        <span className="text-purple-600 font-bold">+20</span>
                        <span>Words starting with a vowel</span>
                      </div>
                      <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg shadow-sm">
                        <span className="text-blue-600 font-bold">+30</span>
                        <span>Words with no repeating letters</span>
                      </div>
                      <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-lg shadow-sm">
                        <span className="text-amber-600 font-bold">+100</span>
                        <span>Finding the daily bonus word</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">WordSurf</h2>
          <p className="mb-6 text-gray-400">Connect words, build chains, score points!</p>
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="text-gray-400 hover:text-white transition">About</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Contact</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Terms</a>
          </div>
          <p className="text-sm text-gray-500">© 2024 WordSurf. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;