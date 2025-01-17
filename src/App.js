import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Timer, Award, AlertCircle, Loader2, Volume2, VolumeX } from 'lucide-react';
import { Alert, AlertDescription } from "./components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/ui/dialog";
import { useWordOfDay } from './hooks/useWordOfDay';
import Navigation from './components/ui/Navigation';

// Define themes with individual letter styling
const THEMES = {
  classic: {
    tile: 'bg-blue-500',
    text: 'text-white',
    connection: 'bg-gray-300',
    middle: 'bg-blue-400',
    letter: 'bg-blue-400'
  },
  neon: {
    tile: 'bg-purple-600',
    text: 'text-green-400',
    connection: 'bg-pink-400',
    middle: 'bg-purple-500',
    letter: 'bg-purple-500'
  },
  forest: {
    tile: 'bg-green-700',
    text: 'text-yellow-200',
    connection: 'bg-brown-400',
    middle: 'bg-green-600',
    letter: 'bg-green-600'
  },
  sunset: {
    tile: 'bg-orange-500',
    text: 'text-yellow-100',
    connection: 'bg-red-300',
    middle: 'bg-orange-400',
    letter: 'bg-orange-400'
  }
};

const BONUS_RULES = [
  { condition: (word) => word.length >= 8, points: 50, message: 'Long Word!' },
  { condition: (word) => /^[aeiou]/i.test(word), points: 20, message: 'Vowel Start!' },
  { condition: (word) => new Set(word).size === word.length, points: 30, message: 'No Repeating Letters!' },
];

const WordChainGame = () => {
  const [gameActive, setGameActive] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const { wordOfTheDay, nextWordTime, isLoading: isLoadingWord, error: wordError } = useWordOfDay();
  const [words, setWords] = useState(['start']);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('classic');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastBonus, setLastBonus] = useState(null);
  
  // High score state
  const [highScore, setHighScore] = useState({ name: '', score: 0 });
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const [playerName, setPlayerName] = useState('');

  // Load high score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('wordChainHighScore');
    if (savedHighScore) {
      setHighScore(JSON.parse(savedHighScore));
    }
  }, []);

  // Sound effect callback
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    // Add your sound implementation here
    console.log(`Playing ${type} sound`);
  }, [soundEnabled]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameActive(false);
            checkHighScore(score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, score]);

  // Game functions
  const calculateBonus = (word) => {
    let bonusPoints = 0;
    let bonusMessage = '';

    for (const rule of BONUS_RULES) {
      if (rule.condition(word)) {
        bonusPoints += rule.points;
        bonusMessage = rule.message;
      }
    }

    if (bonusPoints > 0) {
      setLastBonus({ points: bonusPoints, message: bonusMessage });
      setTimeout(() => setLastBonus(null), 2000);
      playSound('bonus');
    }

    return bonusPoints;
  };

  const validateWord = async (word) => {
    if (!word || word.length < 2) {
      setError('Word must be at least 2 letters long');
      return false;
    }

    const lastWord = words[words.length - 1];
    if (lastWord && word[0].toLowerCase() !== lastWord.slice(-1).toLowerCase()) {
      setError(`Word must start with the letter '${lastWord.slice(-1).toUpperCase()}'`);
      return false;
    }

    if (words.includes(word.toLowerCase())) {
      setError('Word has already been used');
      return false;
    }

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        setError('Word not found in dictionary');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Dictionary API error:', error);
      return /^[a-zA-Z]+$/.test(word);
    }
  };

  const checkHighScore = (finalScore) => {
    if (finalScore > highScore.score) {
      setShowHighScoreDialog(true);
    }
  };

  const saveHighScore = () => {
    if (!playerName.trim()) return;
    
    const newHighScore = { name: playerName, score };
    setHighScore(newHighScore);
    localStorage.setItem('wordChainHighScore', JSON.stringify(newHighScore));
    setShowHighScoreDialog(false);
    setPlayerName('');
  };

  const startGame = () => {
    if (!wordOfTheDay) return; // Don't start if word isn't loaded
    setGameActive(true);
    setTimeLeft(60);
    setWords([wordOfTheDay]);
    setScore(0);
    setError('');
    setCurrentWord('');
    setLastBonus(null);
  };

  const submitWord = async () => {
    if (!currentWord.trim() || !gameActive) return;
    
    setIsLoading(true);
    try {
      const isValid = await validateWord(currentWord.trim().toLowerCase());
      
      if (!isValid) {
        playSound('error');
        setIsLoading(false);
        return;
      }

      const baseScore = currentWord.length * 10;
      const bonusScore = calculateBonus(currentWord);
      const totalScore = baseScore + bonusScore;

      setWords(prev => [...prev, currentWord.toLowerCase()]);
      setScore(prev => prev + totalScore);
      setCurrentWord('');
      setError('');
      playSound('submit');
    } catch (err) {
      setError('Error validating word');
      playSound('error');
    }
    setIsLoading(false);
  };

  const getHelperMessage = () => {
    if (!gameActive) return '';
    const lastWord = words[words.length - 1];
    return `Enter a word that starts with '${lastWord.slice(-1).toUpperCase()}'`;
  };

  // DominoTile component with individual letters
  const DominoTile = ({ word, index }) => {
    const letters = word.split('');
    const currentTheme = THEMES[theme];

    return (
      <div className="flex items-center animate-fadeIn">
        {index > 0 && (
          <div className={`h-4 w-px ${currentTheme.connection} animate-extend`} />
        )}
        <div 
          className="flex shadow-lg rounded-lg overflow-hidden transform hover:scale-105"
        >
          {letters.map((letter, letterIndex) => {
            const isEndLetter = letterIndex === 0 || letterIndex === letters.length - 1;
            return (
              <div
                key={letterIndex}
                className={`
                  ${isEndLetter ? currentTheme.tile : currentTheme.letter} 
                  ${currentTheme.text}
                  p-3 flex items-center justify-center font-bold
                  ${letterIndex > 0 ? 'border-l border-opacity-20 border-white' : ''}
                `}
              >
                {letter.toUpperCase()}
              </div>
            );
          })}
        </div>
        {index < words.length - 1 && (
          <div className={`h-4 w-px ${currentTheme.connection} animate-extend`} />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
    <Navigation />
    <main className="pt-20 p-4">
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center flex-wrap gap-4">
          <span>Word Chain</span>
          <div className="flex items-center gap-4">
            <Award className="text-yellow-500" />
            <span className="text-xl">{score}</span>
            <Timer className="text-blue-500" />
            <span className="text-xl">{timeLeft}s</span>
          </div>
        </CardTitle>
        <div className="flex flex-col gap-2">
          {highScore.name && (
            <div className="text-sm text-gray-600">
              👑 {highScore.name} is the King with {highScore.score} points!
            </div>
          )}
          <div className="text-sm">
            {isLoadingWord ? (
              <span>Loading word of the day...</span>
            ) : wordError ? (
              <span className="text-red-500">{wordError}</span>
            ) : (
              <>
                <span className="font-medium">Word of the Day:</span>{" "}
                <span className="text-primary">{wordOfTheDay}</span>
                <span className="ml-4 text-gray-500">
                  Next word in: {nextWordTime}
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!gameActive ? (
          <Button 
            onClick={startGame}
            className="w-full mb-4"
          >
            Start Game
          </Button>
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    value={currentWord}
                    onChange={(e) => setCurrentWord(e.target.value)}
                    placeholder={getHelperMessage()}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && submitWord()}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={submitWord} 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </div>
                
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="px-2 py-1 rounded border"
                >
                  {Object.keys(THEMES).map(themeName => (
                    <option key={themeName} value={themeName}>
                      {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {lastBonus && (
              <div className="fixed top-4 right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg shadow-lg animate-bounce">
                {lastBonus.message} +{lastBonus.points}
              </div>
            )}

            {/* Responsive word chain container */}
            <div className="overflow-x-auto">
              <div className="flex flex-wrap gap-4 p-4 min-w-min">
                {words.map((word, index) => (
                  <div key={index} className="flex-none">
                    <DominoTile word={word} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* High Score Dialog */}
        <Dialog open={showHighScoreDialog} onOpenChange={setShowHighScoreDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New High Score! 🎉</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">Amazing! You scored {score} points!</p>
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={saveHighScore}>Save Score</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
    </main>
    </div>
  );
};

export default WordChainGame;