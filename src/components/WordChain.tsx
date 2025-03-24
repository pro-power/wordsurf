import React from 'react';

interface WordChainProps {
  words: string[];
  className?: string;
}

const WordChain: React.FC<WordChainProps> = ({ words, className = '' }) => {
  if (!words || words.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          {/* Word Tile (Domino Style) */}
          <div className="relative bg-white rounded-lg border-2 border-blue-400 shadow-md px-4 py-2 flex items-center justify-center min-w-[100px]">
            <span className="font-bold text-lg text-blue-600">{word.toUpperCase()}</span>
            
            {/* Letters Highlight */}
            {index > 0 && (
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-yellow-300 flex items-center justify-center">
                <span className="text-xs font-bold">{word.charAt(0).toUpperCase()}</span>
              </div>
            )}
            
            {index < words.length - 1 && (
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-green-300 flex items-center justify-center">
                <span className="text-xs font-bold">{word.charAt(word.length - 1).toUpperCase()}</span>
              </div>
            )}
          </div>
          
          {/* Connecting Wave Line */}
          {index < words.length - 1 && (
            <div className="relative w-8 h-6">
              <svg 
                width="32" 
                height="24" 
                viewBox="0 0 32 24" 
                className="absolute top-0 left-0"
              >
                <path 
                  d="M0,12 C8,4 24,20 32,12" 
                  stroke="#60A5FA" 
                  strokeWidth="2" 
                  fill="none" 
                  strokeDasharray="2,2"
                />
              </svg>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default WordChain;