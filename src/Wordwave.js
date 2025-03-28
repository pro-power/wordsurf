import React, { useState, useEffect, useRef } from 'react';
import { wordService } from './services/wordService';
import leaderboardService from './services/leaderboardService';
import Navigation from './components/ui/Navigation';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog';
import { Alert, AlertDescription } from './components/ui/alert';
import { Badge } from './components/ui/badge';
import ResponsiveInputField from './components/ui/ResponsiveInputField';
import ChainDisplay from './components/ui/ChainDisplay';
import { 
  Clock,  
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  AlertTriangle,
  AlignJustify,
  BookOpenCheck
} from 'lucide-react';

const WordChainGame = () => {
  const [gameState, setGameState] = useState('ready'); // ready, playing, finished
  const [wordOfTheDay, setWordOfTheDay] = useState('');
  const [wordDefinition, setWordDefinition] = useState('');
  const [bonusWord, setBonusWord] = useState('');
  const [foundBonusWord, setFoundBonusWord] = useState(false);
  const [currentChain, setCurrentChain] = useState([]);
  const [inputWord, setInputWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showSubmitScore, setShowSubmitScore] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [wordHistory, setWordHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [bonusAnimationActive, setBonusAnimationActive] = useState(false);
  const [showBonusHint, setShowBonusHint] = useState(false);
  const [showDefinitionHint, setShowDefinitionHint] = useState(false);
  const [bonusWordDefinition, setBonusWordDefinition] = useState('');
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Load word of the day on component mount
  useEffect(() => {
    const loadWordOfTheDay = async () => {
      setIsLoading(true);
      try {
        const data = await wordService.getWordOfTheDay();
        setWordOfTheDay(data.word);
        setBonusWord(data.bonusWord);
        
        if (data.word) {
          const definition = await wordService.getWordDefinition(data.word);
          setWordDefinition(definition);
        }
      } catch (error) {
        console.error('Error loading word of the day:', error);
        setAlertMessage('Failed to load word of the day. Please try again.');
        setAlertType('error');
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadWordOfTheDay();
  }, []);

  // Load the bonus word definition when the game starts
  useEffect(() => {
    const loadBonusWordDefinition = async () => {
      if (bonusWord) {
        try {
          const definition = await wordService.getWordDefinition(bonusWord);
          setBonusWordDefinition(definition);
        } catch (error) {
          console.error('Error loading bonus word definition:', error);
        }
      }
    };

    if (gameState === 'playing') {
      loadBonusWordDefinition();
    }
  }, [gameState, bonusWord]);

  // Timer countdown during game
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          // Show bonus hint when 25 seconds have passed (35 seconds remaining)
          if (prev === 35 && !showBonusHint) {
            setShowBonusHint(true);
          }
          
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [gameState, showBonusHint]);

  // Focus input when game starts
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  // Check score during gameplay
  useEffect(() => {
    if (gameState === 'playing' && score > 1500 && timeLeft <= 30 && !showDefinitionHint) {
      setShowDefinitionHint(true);
    }
  }, [score, timeLeft, gameState, showDefinitionHint]);

  // Show bonus hint notification
  useEffect(() => {
    if (showBonusHint && bonusWord) {
      setAlertMessage(`First letter hint for the bonus word is " ${bonusWord.charAt(0).toUpperCase()}"`);
      setAlertType('info');
      setShowAlert(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
    }
  }, [showBonusHint, bonusWord]);

  // Show definition hint notification
  useEffect(() => {
    if (showDefinitionHint && bonusWordDefinition) {
      setAlertMessage(`You unlocked the bonus word definition hint: ${bonusWordDefinition}`);
      setAlertType('info');
      setShowAlert(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
    }
  }, [showDefinitionHint, bonusWordDefinition]);

  const BonusHints = () => {
    return (
      <div className="mt-4 bg-amber-50 rounded-lg p-3 border border-amber-200">
        <h4 className="text-sm font-semibold text-amber-800 flex items-center mb-2">
          <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" />
          Bonus Word Hints
        </h4>
        
        {!showBonusHint && !showDefinitionHint && (
          <div className="text-sm text-amber-700">
            Hints will appear as you play...
          </div>
        )}
      </div>
    );
  };

  const startGame = () => {
    // If we have a word of the day, start the game
    if (wordOfTheDay) {
      setGameState('playing');
      setTimeLeft(60);
      setScore(0);
      setCurrentChain([wordOfTheDay]);
      setWordHistory([]);
      setFoundBonusWord(false);
      setMessage({ text: '', type: '' });
      setShowBonusHint(false);
      setShowDefinitionHint(false);
    } else {
      setAlertMessage('No word of the day available. Please reload the page.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const validateWord = (word) => {
    // Simple validation - real implementation would use a dictionary API
    if (word.length < 3) {
      return { valid: false, message: 'Word must be at least 3 letters long' };
    }

    // Check if word was already used
    if (currentChain.includes(word)) {
      return { valid: false, message: 'Word already used in this chain' };
    }

    // Check if word starts with the last letter of the previous word
    const previousWord = currentChain[currentChain.length - 1];
    const lastLetter = previousWord[previousWord.length - 1];
    if (word[0].toLowerCase() !== lastLetter.toLowerCase()) {
      return { valid: false, message: `Word must start with the letter '${lastLetter}'` };
    }

    return { valid: true };
  };

  const calculateWordScore = (word) => {
    // Base score: 10 points per letter
    let wordScore = word.length * 10;
    
    // Bonus for words longer than 8 letters
    if (word.length > 8) {
      wordScore += 50;
    }
    
    // Bonus for words starting with a vowel
    if (['a', 'e', 'i', 'o', 'u'].includes(word[0].toLowerCase())) {
      wordScore += 20;
    }
    
    // Bonus for words with no repeating letters
    const uniqueLetters = new Set(word.toLowerCase()).size;
    if (uniqueLetters === word.length) {
      wordScore += 30;
    }
    
    // Check if it's the bonus word
    if (word.toLowerCase() === bonusWord.toLowerCase() && !foundBonusWord) {
      wordScore += 100;
      setFoundBonusWord(true);
      setBonusAnimationActive(true);
      setTimeout(() => setBonusAnimationActive(false), 3000);
    }
    
    return wordScore;
  };

  const handleSubmitWord = (e) => {
    e.preventDefault();
    
    if (gameState !== 'playing') return;
    
    const word = inputWord.trim().toLowerCase();
    if (!word) return;
    
    const validation = validateWord(word);
    
    if (validation.valid) {
      // Add word to chain
      setCurrentChain([...currentChain, word]);
      
      // Calculate score
      const wordScore = calculateWordScore(word);
      setScore(prevScore => prevScore + wordScore);
      
      // Add to word history with score
      setWordHistory(prev => [...prev, { word, score: wordScore, isBonusWord: word.toLowerCase() === bonusWord.toLowerCase() }]);
      
      // Clear input
      setInputWord('');
      
      // Display positive message
      setMessage({ text: `+${wordScore} points!`, type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 1500);
    } else {
      // Display error message
      setMessage({ text: validation.message, type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 1500);
    }
  };

  const handleGameOver = () => {
    setShowSubmitScore(true);
  };

  const handleSubmitScore = async () => {
    if (!playerName.trim()) {
      setAlertMessage('Please enter your name to submit your score.');
      setAlertType('warning');
      setShowAlert(true);
      return;
    }
    
    try {
      await leaderboardService.saveScore({
        name: playerName,
        email: playerEmail || 'anonymous@example.com', // Use a default if no email
        score
      });
      
      setShowSubmitScore(false);
      setAlertMessage('Score submitted successfully!');
      setAlertType('success');
      setShowAlert(true);
    } catch (error) {
      console.error('Error submitting score:', error);
      setAlertMessage('Failed to submit score. Please try again.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const getProgressColor = () => {
    if (timeLeft > 45) return 'bg-green-500';
    if (timeLeft > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      {/* Alert message */}
      {showAlert && (
        <div className="fixed top-20 right-4 z-50">
          <Alert className={`shadow-lg border-l-4 ${
            alertType === 'success' ? 'border-green-500 bg-green-50' : 
            alertType === 'warning' ? 'border-yellow-500 bg-yellow-50' : 
            alertType === 'info' ? 'border-blue-500 bg-blue-50' :
            'border-red-500 bg-red-50'
          }`}>
            <AlertDescription className="flex items-center">
              {alertType === 'success' ? <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> : 
               alertType === 'warning' ? <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" /> : 
               alertType === 'info' ? <Sparkles className="w-5 h-5 mr-2 text-blue-500" /> :
               <XCircle className="w-5 h-5 mr-2 text-red-500" />}
              {alertMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Game Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              WordSurf
            </h1>
            <p className="text-gray-600">Connect words, build chains, score points!</p>
          </div>
          
          {/* Game Card */}
          <Card className="shadow-xl border-0 overflow-hidden">
            {/* Game Header */}
            <div className={`p-4 ${gameState === 'playing' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Let's get Surfing</h2>
                {gameState === 'playing' && (
                  <div className="flex items-center text-white">
                    <Clock className="w-5 h-5 mr-1" />
                    <span className="font-bold">{timeLeft}s</span>
                  </div>
                )}
              </div>
            </div>
            
            <CardContent className="p-6">
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : gameState === 'ready' ? (
                <div className="text-center space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-xl font-bold text-blue-700 mb-2 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 mr-2" /> Word of the Day
                    </h3>
                    <p className="text-3xl font-bold mb-2">{wordOfTheDay}</p>
                    <Badge className="mb-3 bg-blue-100 text-blue-800">Starting Word</Badge>
                    <p className="text-gray-600 italic">{wordDefinition}</p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
                      <h3 className="text-lg font-bold text-amber-700">Bonus Word Available!</h3>
                    </div>
                    <p className="text-gray-600">
                      There's a hidden bonus word related to "{wordOfTheDay}" that will give you +100 points!
                    </p>
                  </div>
                  
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg"
                    onClick={startGame}
                  >
                    Start Game
                  </Button>
                </div>
              ) : gameState === 'playing' ? (
                <div>
                  {/* Timer Bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
                      style={{ width: `${(timeLeft / 60) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Current Word Chain - Snake Domino Tiles */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                      <AlignJustify className="w-4 h-4 mr-1" /> Current Chain
                    </h3>
                    <div className="relative border border-gray-100 rounded-lg p-2">
                      {/* Show Last 3 Words for Quick Reference */}
                      {currentChain.length > 3 && (
                        <div className="mb-2 pb-2 border-b border-dashed border-gray-200">
                          <div className="flex items-center">
                            <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                              First: {currentChain[0]}
                            </div>
                            <div className="ml-auto px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                              Words: {currentChain.length}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Snake Domino Chain */}
                      <ChainDisplay currentChain={currentChain} />
                    </div>
                  </div>
                  
                  {/* Word Input */}
                  <ResponsiveInputField
                    inputRef={inputRef}
                    inputWord={inputWord}
                    setInputWord={setInputWord}
                    handleSubmitWord={handleSubmitWord}
                    currentChain={currentChain}
                    message={message}
                  />
                  
                  {/* Score Display */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">Words</h3>
                      <p className="text-2xl font-bold">{currentChain.length - 1}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">Score</h3>
                      <p className="text-2xl font-bold text-blue-600">{score}</p>
                    </div>
                  </div>

                  {/* Bonus Hints */}
                  <BonusHints />
                  
                  {/* Bonus Word Animation */}
                  {bonusAnimationActive && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                      <div className="bg-amber-100 bg-opacity-90 p-8 rounded-lg shadow-xl animate-bounce">
                        <div className="text-center">
                          <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                          <h3 className="text-2xl font-bold text-amber-800">BONUS WORD!</h3>
                          <p className="text-amber-900 text-lg">+100 points</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : gameState === 'finished' && (
                <div className="text-center space-y-6">
                  {/* Wave Animation for Game Completion */}
                  <div className="relative h-16 mb-4 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {Array.from({ length: 12 }).map((_, index) => (
                        <div 
                          key={index}
                          className="absolute bg-blue-500 opacity-30 rounded-full"
                          style={{
                            width: '100%',
                            height: '100px',
                            animationDelay: `${index * 0.1}s`,
                            animationDuration: '3s',
                            animationIterationCount: 'infinite',
                            animationName: 'wave',
                            animationTimingFunction: 'ease-in-out',
                          }}
                        />
                      ))}
                      <style jsx>{`
                        @keyframes wave {
                          0% {
                            transform: scale(0);
                            opacity: 0.7;
                          }
                          100% {
                            transform: scale(3);
                            opacity: 0;
                          }
                        }
                      `}</style>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text z-10">
                        Game Complete!
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-700 mb-2 flex items-center justify-center">
                      <Trophy className="w-6 h-6 mr-2" /> Game Over!
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">Words</p>
                        <p className="text-2xl font-bold">{currentChain.length - 1}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">Final Score</p>
                        <p className="text-2xl font-bold text-blue-600">{score}</p>
                      </div>
                    </div>
                    
                    {foundBonusWord && (
                      <div className="bg-amber-100 p-3 rounded-lg flex items-center mb-4">
                        <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
                        <p className="text-amber-800 font-medium">
                          You found the bonus word: <span className="font-bold">{bonusWord}</span>!
                        </p>
                      </div>
                    )}
                  </div>

                  
                  {/* Word History with Snake Domino Visualization */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
                      <BookOpenCheck className="w-5 h-5 mr-2" /> Your Word Chain
                    </h3>
                    
                    {/* Domino Visualization of Complete Word Chain */}
                    <ChainDisplay 
                      currentChain={currentChain}
                      wordHistory={wordHistory}
                      gameOver={true}
                      bonusWord={bonusWord}
                    />
                    
                    {/* Word List Table */}
                    <h4 className="text-sm font-semibold text-gray-500 mb-2 mt-4">Surf Score</h4>
                    <div className="max-h-40 overflow-y-auto pr-2">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-gray-500 text-sm font-medium">Word</th>
                            <th className="py-2 text-gray-500 text-sm font-medium text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wordHistory.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100 last:border-0">
                              <td className="py-2 font-medium flex items-center">
                                {item.word}
                                {item.isBonusWord && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                                    Bonus
                                  </span>
                                )}
                              </td>
                              <td className="py-2 text-right font-bold text-blue-600">
                                +{item.score}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={startGame}
                    >
                      Play Again
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleGameOver}
                    >
                      Submit Score
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Submit Score Dialog */}
      <Dialog open={showSubmitScore} onOpenChange={setShowSubmitScore}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Your Score</DialogTitle>
            <DialogDescription>
              Enter your information to record your score on the leaderboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-700">Your Score</p>
                <p className="text-3xl font-bold text-blue-700">{score}</p>
              </div>
              <Trophy className="w-10 h-10 text-blue-500" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email (optional)
              </label>
              <Input
                id="email"
                type="email"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                placeholder="Enter your email"
              />
              <p className="text-xs text-gray-500">
                Your email will not be shared.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubmitScore(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmitScore}
            >
              Submit Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WordChainGame;