import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';

const ResponsiveInputField = ({ 
  inputRef, 
  inputWord, 
  setInputWord, 
  handleSubmitWord, 
  currentChain,
  message 
}) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // Track window width for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  // Generate appropriate placeholder text based on screen size
  const getPlaceholder = () => {
    const lastLetter = currentChain[currentChain.length - 1].slice(-1);
    
    if (windowWidth < 350) {
      // Extremely small screens
      return `Starts with "${lastLetter}"`;
    } else if (windowWidth < 480) {
      // Small mobile screens
      return `Starts with "${lastLetter}"`;
    } else {
      // Larger screens
      return `Enter a word starting with "${lastLetter}"`;
    }
  };
  
  return (
    <form onSubmit={handleSubmitWord} className="mb-6">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputWord}
          onChange={(e) => setInputWord(e.target.value)}
          placeholder={getPlaceholder()}
          className="pr-24 text-lg shadow-sm"
          autoComplete="off"
        />
        <Button 
          type="submit"
          className="absolute right-0 top-0 h-full rounded-l-none bg-blue-600 hover:bg-blue-700"
        >
          Submit
        </Button>
      </div>
      
      {message.text && (
        <div className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </div>
      )}
      
      {windowWidth < 480 && (
        <div className="mt-2 text-xs text-gray-500">
          Start your next word with the letter "{currentChain[currentChain.length - 1].slice(-1)}"
        </div>
      )}
    </form>
  );
};

export default ResponsiveInputField;