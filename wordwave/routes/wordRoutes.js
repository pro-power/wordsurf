import express from 'express';
import WordOfDay from '../models/WordOfDay.js';
import fetch from 'node-fetch';

const router = express.Router();

// Fallback word pool - using COMMON English words only
const WORD_POOL = [
  'chain', 'start', 'plant', 'table', 'house', 'light', 'music', 
  'brain', 'dance', 'world', 'smile', 'green', 'bread', 'phone',
  'water', 'earth', 'paper', 'glass', 'dream', 'color', 'ocean'
];

// Dictionary of related words for each word in our pool
const RELATED_WORDS = {
  'chain': ['link', 'connect', 'metal', 'bind'],
  'start': ['begin', 'launch', 'initiate', 'commence'],
  'plant': ['grow', 'flower', 'garden', 'seed'],
  'table': ['chair', 'desk', 'furniture', 'dining'],
  'house': ['home', 'building', 'residence', 'dwelling'],
  'light': ['bright', 'lamp', 'shine', 'glow'],
  'music': ['song', 'melody', 'rhythm', 'sound'],
  'water': ['liquid', 'ocean', 'river', 'hydrate'],
  'earth': ['planet', 'soil', 'ground', 'nature'],
  'paper': ['document', 'sheet', 'write', 'notebook'],
  'glass': ['window', 'mirror', 'transparent', 'crystal'],
  'dream': ['sleep', 'goal', 'aspiration', 'vision'],
  'color': ['paint', 'hue', 'shade', 'pigment'],
  'ocean': ['sea', 'wave', 'marine', 'water']
};

// Get today's date in YYYY-MM-DD format, aligned to midnight
const getTodayDateString = () => {
  // Create a date object for the current time
  const now = new Date();
  
  // Create a new date string with just the date part (YYYY-MM-DD)
  // This effectively sets the time to midnight in UTC
  return now.toISOString().split('T')[0];
};

// Fallback: generate a deterministic word based on date
const getDeterministicWord = (dateStr) => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % WORD_POOL.length;
  return WORD_POOL[index];
};

// Fetch a random word from the API
const fetchRandomWord = async () => {
  try {
    const response = await fetch('https://random-word.ryanrk.com/api/en/word/random/?minlength=4&maxlength=8');
    
    if (!response.ok) {
      throw new Error(`Word API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data[0]) {
      throw new Error('API returned empty or invalid data');
    }
    
    return data[0].toLowerCase();
  } catch (error) {
    console.error('Failed to fetch random word:', error);
    throw error;
  }
};

// Get word definition AND validate the word exists
const getWordDefinition = async (word) => {
  try {
    console.log('Fetching definition for:', word);
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    
    if (!response.ok) {
      console.log(`Definition API returned ${response.status} for word "${word}" - it's not valid`);
      return null; // Word doesn't exist or isn't valid
    }
    
    const data = await response.json();
    
    if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
      const firstMeaning = data[0].meanings[0];
      return `${firstMeaning.partOfSpeech}: ${firstMeaning.definitions[0].definition}`;
    }
    
    return "A word to start your chain with!";
  } catch (error) {
    console.error('Failed to fetch word definition:', error);
    return null; // Consider the word invalid if we can't get a definition
  }
};

// Find a valid English word with definition
const getValidRandomWord = async (maxAttempts = 10) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt} to find valid word`);
      const word = await fetchRandomWord();
      console.log(`Checking if "${word}" is valid...`);
      
      // Use the definition API to validate the word
      const definition = await getWordDefinition(word);
      
      if (definition) {
        console.log(`Found valid word: "${word}" with definition`);
        return { word, definition };
      }
      
      console.log(`Word "${word}" is not valid, trying again...`);
    } catch (error) {
      console.error(`Error in attempt ${attempt}:`, error);
      // Continue to the next attempt
    }
  }
  
  // If we can't find a valid word after maximum attempts, 
  // use a fallback from our known word pool
  console.log('Using fallback word from pool after failed attempts');
  const fallbackWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
  return { 
    word: fallbackWord, 
    definition: "A word to start your chain with!"
  };
};

// Generate a related bonus word
const generateBonusWord = async (word) => {
  try {
    // Try to get related words from DataMuse API
    console.log('Fetching related words for:', word);
    const response = await fetch(`https://api.datamuse.com/words?ml=${word}&max=15`);
    
    if (!response.ok) {
      throw new Error(`DataMuse API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      // Filter for words 4-8 characters
      const filteredWords = data.filter(item => 
        item.word.length >= 4 && 
        item.word.length <= 8 &&
        !item.word.includes(' ') // Avoid phrases
      );
      
      if (filteredWords.length > 0) {
        // Check each potential bonus word to ensure it's valid
        for (const item of filteredWords) {
          const definition = await getWordDefinition(item.word);
          if (definition) {
            console.log('Selected valid bonus word:', item.word);
            return item.word;
          }
        }
      }
    }
    
    // Fallback to predefined related words
    if (RELATED_WORDS[word]) {
      console.log('Using predefined related words');
      return RELATED_WORDS[word][Math.floor(Math.random() * RELATED_WORDS[word].length)];
    }
    
    // Ultimate fallback - select a different word from pool
    console.log('Using ultimate fallback for bonus word');
    let fallbackWord;
    do {
      fallbackWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    } while (fallbackWord === word);
    
    return fallbackWord;
  } catch (error) {
    console.error('Failed to generate bonus word:', error);
    
    // Fallback to a different word from our pool
    let fallbackWord;
    do {
      fallbackWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    } while (fallbackWord === word);
    
    return fallbackWord;
  }
};

// GET endpoint to fetch the word of the day
router.get('/word-of-day', async (req, res) => {
  try {
    // Get today's date, aligned to midnight
    const today = getTodayDateString();
    console.log('Fetching word of day for date:', today);
    
    // Check if we already have a word for today in the database
    let wordOfDay = await WordOfDay.findOne({ date: today });
    
    if (wordOfDay) {
      console.log('Found existing word of day:', wordOfDay);
      
      // Return the existing word
      return res.json({
        word: wordOfDay.word,
        bonusWord: wordOfDay.bonusWord,
        definition: wordOfDay.definition
      });
    }
    
    console.log('No word found for today, generating new one');
    
    // Get a valid random word with definition
    const { word: newWord, definition } = await getValidRandomWord();
    
    // Generate a bonus word (which is also validated by definition API)
    const bonusWord = await generateBonusWord(newWord);
    
    // Create new word of the day entry in database
    console.log('Creating new WordOfDay entry in database');
    wordOfDay = new WordOfDay({
      word: newWord,
      bonusWord,
      definition,
      date: today
    });
    
    await wordOfDay.save();
    console.log('Successfully saved new word of day to database');
    
    // Return the new word
    res.json({
      word: newWord,
      bonusWord,
      definition
    });
  } catch (error) {
    console.error('Error fetching word of the day:', error);
    
    // If all else fails, use deterministic word based on date
    const fallbackWord = getDeterministicWord(getTodayDateString());
    
    res.status(500).json({ 
      error: 'Failed to get word of the day',
      message: error.message,
      fallbackWord
    });
  }
});

// Clear the current word of the day (for testing)
router.delete('/word-of-day', async (req, res) => {
  try {
    const today = getTodayDateString();
    await WordOfDay.deleteOne({ date: today });
    res.json({ message: 'Word of the day cleared successfully' });
  } catch (error) {
    console.error('Error clearing word of the day:', error);
    res.status(500).json({ error: 'Failed to clear word of the day' });
  }
});

// Test endpoint to check if service is running
router.get('/test', (req, res) => {
  res.json({ message: 'Word API is working!' });
});

export default router;