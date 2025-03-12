// Updated wordService.js with midnight reset alignment

// Utility function to get today's date in YYYY-MM-DD format
// This ensures it changes at midnight
const getTodayDateString = () => {
  // Create a date object for the current time
  const now = new Date();
  
  // Create a new date string with just the date part (YYYY-MM-DD)
  // This effectively sets the time to midnight in UTC
  return now.toISOString().split('T')[0];
};

// Client-side cache 
const getStoredWordData = () => {
  return {
    word: localStorage.getItem('wordOfTheDay'),
    bonusWord: localStorage.getItem('bonusWord'),
    definition: localStorage.getItem('wordDefinition'),
    date: localStorage.getItem('wordOfDayDate')
  };
};

// Store word data in client-side cache
const storeWordData = (word, bonusWord, definition) => {
  const today = getTodayDateString();
  localStorage.setItem('wordOfTheDay', word);
  localStorage.setItem('bonusWord', bonusWord);
  localStorage.setItem('wordDefinition', definition);
  localStorage.setItem('wordOfDayDate', today);
};

// Clear all stored word data
const clearWordData = () => {
  localStorage.removeItem('wordOfTheDay');
  localStorage.removeItem('wordOfDayDate');
  localStorage.removeItem('bonusWord');
  localStorage.removeItem('wordDefinition');
  console.log('Cleared word data from localStorage');
};

// Fallback word logic in case server is completely unreachable
const FALLBACK_WORDS = [
  'chain', 'start', 'plant', 'table', 'house', 'light', 'music', 
  'brain', 'dance', 'world', 'smile', 'green', 'bread', 'phone'
];

const getDeterministicWord = () => {
  const today = getTodayDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    const char = today.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % FALLBACK_WORDS.length;
  return FALLBACK_WORDS[index];
};

const getDeterministicBonusWord = (word) => {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = ((hash << 5) - hash) + word.charCodeAt(i);
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % FALLBACK_WORDS.length;
  return FALLBACK_WORDS[index] !== word ? FALLBACK_WORDS[index] : FALLBACK_WORDS[(index + 1) % FALLBACK_WORDS.length];
};

// The main wordService object with public methods
export const wordService = {
  // Get the word of the day from the server
  getWordOfTheDay: async () => {
    try {
      // First check client-side cache to avoid unnecessary API calls
      const storedData = getStoredWordData();
      const today = getTodayDateString();
      
      // If we have today's data in the cache, use it
      if (storedData.word && storedData.date === today) {
        console.log('Using cached word of the day:', storedData.word);
        return {
          word: storedData.word,
          bonusWord: storedData.bonusWord,
          definition: storedData.definition
        };
      }
      
      // Otherwise, fetch from server API
      console.log('Fetching word of the day from server...');
      // API endpoint URL - make sure this matches your server
      const apiUrl = 'http://localhost:5000/api/words/word-of-day';
      
      try {
        // First try to connect to our backend API
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Timeout of 5 seconds to avoid hanging
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data from server:', data);
        
        // Store in local cache
        storeWordData(data.word, data.bonusWord, data.definition);
        
        return {
          word: data.word,
          bonusWord: data.bonusWord,
          definition: data.definition
        };
      } catch (serverError) {
        // If server API fails, log the error
        console.error('Server API failed:', serverError);
        throw serverError;
      }
    } catch (error) {
      console.error('Complete failure in getWordOfTheDay:', error);
      
      // Ultimate fallback - use deterministic approach
      const word = getDeterministicWord();
      const bonusWord = getDeterministicBonusWord(word);
      
      console.log('Using deterministic fallback word:', word);
      
      // Store even the fallback in cache
      storeWordData(word, bonusWord, "A word to start your chain with!");
      
      return { 
        word, 
        bonusWord,
        definition: "A word to start your chain with!"
      };
    }
  },
  
  // Get the word definition
  getWordDefinition: async (word) => {
    // If it's the word of the day, we should already have the definition
    const storedData = getStoredWordData();
    if (word === storedData.word && storedData.definition) {
      return storedData.definition;
    }
    
    try {
      // Try to get definition from Dictionary API
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
        signal: AbortSignal.timeout(3000)  // 3 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Dictionary API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
        const firstMeaning = data[0].meanings[0];
        return `${firstMeaning.partOfSpeech}: ${firstMeaning.definitions[0].definition}`;
      }
    } catch (error) {
      console.error('Failed to fetch word definition:', error);
    }
    
    return "A word to start your chain with!";
  },
  
  // Check if a word is the bonus word
  checkBonusWord: (word) => {
    const bonusWord = localStorage.getItem('bonusWord');
    return bonusWord && word.toLowerCase() === bonusWord.toLowerCase();
  },
  
  // Get the current bonus word
  getBonusWord: () => {
    return localStorage.getItem('bonusWord');
  },
  
  // Force refresh the word data
  forceRefresh: async () => {
    clearWordData();
    return wordService.getWordOfTheDay();
  },
  
  // Test method for debugging
  testServerConnection: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/words/test');
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Server connection test:', data);
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Server connection test failed:', error);
      return { success: false, error: error.message };
    }
  }
};