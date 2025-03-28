import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

/**
 * ChainDisplay - A modernized component to display word chains as a snake-like pattern
 * 
 * @param {Object} props
 * @param {Array} props.currentChain - Array of words in the chain
 * @param {Array} props.wordHistory - Optional array of word history objects with scores
 * @param {boolean} props.showScores - Whether to show scores for each word
 * @param {boolean} props.gameOver - Whether this is displayed on the game over screen
 */
const ChainDisplay = ({ 
  currentChain, 
  wordHistory = [], 
  showScores = false,
  gameOver = false,
  bonusWord = ""
}) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [hovered, setHovered] = useState(null);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Calculate how many dominoes we can fit in each row based on window width
  const getTilesPerRow = () => {
    if (windowWidth < 400) return 3;
    if (windowWidth < 640) return 4;
    if (windowWidth < 768) return 5;
    return 6;
  };

  const tilesPerRow = getTilesPerRow();
  
  // Group words into rows for the snake pattern
  const createSnakeRows = () => {
    const rows = [];
    let currentRow = [];
    
    currentChain.forEach((word, index) => {
      // Find word data in history if available
      const historyItem = wordHistory.find(item => item.word === word);
      const isBonusWord = bonusWord && word.toLowerCase() === bonusWord.toLowerCase();
      
      currentRow.push({
        word,
        index,
        isFirst: index === 0,
        isLast: index === currentChain.length - 1,
        score: historyItem?.score,
        isBonusWord: historyItem?.isBonusWord || isBonusWord
      });
      
      if (currentRow.length === tilesPerRow || index === currentChain.length - 1) {
        // If this is an odd-numbered row, reverse it for the snake effect
        if (rows.length % 2 === 1) {
          currentRow.reverse();
        }
        
        rows.push(currentRow);
        currentRow = [];
      }
    });
    
    return rows;
  };
  
  const snakeRows = createSnakeRows();
  
  // Get last letter for hint text
  const lastLetter = currentChain.length > 0 
    ? currentChain[currentChain.length - 1].slice(-1).toUpperCase() 
    : '';

  return (
    <div className={`
      ${gameOver ? 'bg-white' : 'bg-gradient-to-r from-gray-50 to-blue-50'} 
      p-4 rounded-lg border border-gray-200 shadow-sm
    `}>
      {/* Header with word count and visual style indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium text-gray-800">
          <span className="mr-2">
            {gameOver ? 'Your Word Chain' : 'Current Chain'}
          </span>
          <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
            {currentChain.length}
          </span>
        </div>
        {windowWidth >= 480 && (
          <div className="text-xs font-medium text-blue-600 flex items-center">
            <svg width="24" height="14" viewBox="0 0 24 14" className="text-blue-400">
              <path
                d="M0,7 C4,3 8,11 12,7 C16,3 20,11 24,7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Snake Pattern Container */}
      <div className="space-y-4">
        {snakeRows.map((row, rowIndex) => (
          <div 
            key={`row-${rowIndex}`} 
            className={`flex items-center ${rowIndex % 2 === 1 ? 'justify-end' : 'justify-start'}`}
          >
            {/* Row indicator - modernized with gradient */}
            <div className={`
              flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500
              flex items-center justify-center shadow-sm
              text-xs font-bold text-white ${rowIndex % 2 === 1 ? 'order-last ml-2' : 'order-first mr-2'}
            `}>
              {rowIndex + 1}
            </div>
            
            {/* Connector to previous row (except for first row) */}
            {rowIndex > 0 && (
              <div className={`
                flex-shrink-0 h-10 w-5 -my-4 relative
                ${rowIndex % 2 === 1 ? 'order-first' : 'order-last'}
              `}>
                <svg width="100%" height="100%" className="text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  
                </svg>
              </div>
            )}
            
            {/* Word tiles */}
            <div className={`flex items-center ${rowIndex % 2 === 1 ? 'flex-row-reverse' : 'flex-row'}`}>
              {row.map((tile, tileIndex) => (
                <React.Fragment key={`tile-${rowIndex}-${tileIndex}`}>
                  <DominoTile 
                    word={tile.word}
                    isFirst={tile.isFirst}
                    isLast={tile.isLast}
                    rowIndex={rowIndex}
                    windowWidth={windowWidth}
                    score={tile.score}
                    showScore={showScores}
                    isBonusWord={tile.isBonusWord}
                    isHovered={hovered === `${tile.index}-${tile.word}`}
                    onHover={() => setHovered(`${tile.index}-${tile.word}`)}
                    onLeave={() => setHovered(null)}
                  />
                  
                  {/* Connector between tiles (not for the last tile in row) */}
                  {tileIndex < row.length - 1 && (
                    <div className="flex-shrink-0 mx-1.5 flex items-center">
                      <ChevronRight 
                        size={windowWidth < 480 ? 14 : 16} 
                        className="text-blue-400" 
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Helper text with highlighted letter - modernized */}
      {!gameOver && lastLetter && (
        <div className="mt-4 flex items-center justify-center">
          <div className="text-xs text-gray-600 bg-gray-100 py-1.5 px-3 rounded-full flex items-center">
            <span>Next word must start with </span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs mx-1.5">
              {lastLetter}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const DominoTile = ({ 
  word, 
  isFirst, 
  isLast, 
  rowIndex, 
  windowWidth, 
  score, 
  showScore, 
  isBonusWord,
  isHovered,
  onHover,
  onLeave
}) => {
  // Modern styling based on tile properties
  const getContainerClasses = () => {
    let baseClasses = "flex-shrink-0 rounded-lg transition-all duration-200 group relative ";
    
    // Enhanced styling with gradients and better shadows
    if (isBonusWord) {
      baseClasses += `
        bg-gradient-to-br from-amber-50 to-amber-100 
        border border-amber-200 text-amber-900
        ${isHovered ? 'shadow-md ring-2 ring-amber-300 ring-opacity-50' : 'shadow-sm'}
      `;
    } else if (isFirst) {
      baseClasses += `
        bg-gradient-to-br from-blue-50 to-blue-100 
        border border-blue-200 text-blue-900
        ${isHovered ? 'shadow-md ring-2 ring-blue-300 ring-opacity-50' : 'shadow-sm'}
      `;
    } else if (isLast) {
      baseClasses += `
        bg-gradient-to-br from-green-50 to-green-100 
        border border-green-200 text-green-900
        ${isHovered ? 'shadow-md ring-2 ring-green-300 ring-opacity-50' : 'shadow-sm'}
      `;
    } else {
      baseClasses += `
        bg-gradient-to-br from-white to-gray-50 
        border border-gray-200 text-gray-800
        ${isHovered ? 'shadow-md ring-2 ring-blue-200 ring-opacity-50' : 'shadow-sm'}
      `;
    }
    
    // Responsive padding and scale effect on hover
    if (windowWidth < 350) {
      baseClasses += "px-1.5 py-0.5 text-xs ";
    } else if (windowWidth < 480) {
      baseClasses += "px-2 py-1 text-xs ";
    } else if (windowWidth < 768) {
      baseClasses += "px-2.5 py-1.5 text-sm ";
    } else {
      baseClasses += "px-3 py-1.5 ";
    }
    
    if (isHovered) {
      baseClasses += "transform scale-105 z-10 ";
    }
    
    return baseClasses;
  };
  
  // Truncate long words on small screens
  const getDisplayWord = () => {
    const maxLength = windowWidth < 350 ? 4 : 
                      windowWidth < 480 ? 5 : 
                      windowWidth < 768 ? 6 : 8;
                       
    if (word.length > maxLength) {
      return `${word.substring(0, maxLength-1)}…`;
    }
    return word;
  };

  // Highlight the last letter of each word to emphasize the chain connection
  const displayWord = getDisplayWord();
  const displayLastLetter = displayWord.slice(-1);
  const displayWithoutLastLetter = displayWord.slice(0, -1);
  
  return (
    <div 
      className={getContainerClasses()}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex items-center">
        {/* Icon indicators */}
        {isBonusWord && (
          <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1 flex-shrink-0" />
        )}
        
        {/* Word with highlighted last letter */}
        <span className="font-medium">
          {displayWithoutLastLetter}
          <span className={`
            font-bold 
            ${isBonusWord ? 'text-amber-600' : 
             isFirst ? 'text-blue-600' : 
             isLast ? 'text-green-600' : 'text-blue-500'}
          `}>
            {displayLastLetter}
          </span>
        </span>
        
        {/* Visual indicators for first or last word */}
        {isFirst && !isBonusWord && windowWidth >= 480 && (
          <div className="ml-1 px-1 py-0.5 bg-blue-600 text-white text-xs rounded-sm font-bold">
            1st
          </div>
        )}
        
        {isLast && !isBonusWord && windowWidth >= 480 && (
          <div className="ml-1 px-1 py-0.5 bg-green-600 text-white text-xs rounded-sm font-bold">
            last
          </div>
        )}
      </div>
      
      {/* Display score if enabled - updated with pill style */}
      {showScore && score !== undefined && (
        <div className={`
          mt-1 text-center rounded-full px-1.5 py-0.5 text-xs font-semibold
          ${isBonusWord ? 'bg-amber-200 text-amber-800' : 
           isFirst ? 'bg-blue-200 text-blue-800' : 
           isLast ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}
        `}>
          +{score}
        </div>
      )}
      
      {/* Tooltip for truncated words or bonus words - enhanced */}
      {(word.length > (windowWidth < 350 ? 4 : windowWidth < 480 ? 5 : windowWidth < 768 ? 6 : 8) || isBonusWord) && (
        <div className={`
          opacity-0 group-hover:opacity-100 
          bg-gray-900 text-white text-xs rounded-md py-1 px-2.5
          absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-1.5
          transition-opacity duration-200 whitespace-nowrap pointer-events-none
          before:content-[''] before:absolute before:top-full before:left-1/2 
          before:transform before:-translate-x-1/2 before:border-4
          before:border-transparent before:border-t-gray-900
        `}>
          {isBonusWord ? (
            <div className="flex items-center">
              <Sparkles className="w-3 h-3 text-amber-300 mr-1.5" />
              <span>{word}</span>
              <span className="ml-1.5 text-amber-300 font-semibold">(Bonus!)</span>
            </div>
          ) : word}
        </div>
      )}
    </div>
  );
};

export default ChainDisplay;