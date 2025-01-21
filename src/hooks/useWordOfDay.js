import { useState, useEffect } from 'react';
import { fetchWordOfTheDay, getStoredWordData, storeWordData } from '../services/wordService';

export const useWordOfDay = () => {
  const [wordOfTheDay, setWordOfTheDay] = useState('');
  const [nextWordTime, setNextWordTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatTimeRemaining = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const initializeWordOfDay = async () => {
    try {
      setIsLoading(true);
      const { word: storedWord, date: storedDate } = getStoredWordData();
      const today = new Date().toISOString().split('T')[0];
      console.log("TODAY'S DATE:  ", today);

      if (storedWord && storedDate === today) {
        setWordOfTheDay(storedWord);
      } else {
        const newWord = await fetchWordOfTheDay();
        setWordOfTheDay(newWord);
        storeWordData(newWord);
      }
    } catch (err) {
      setError('Failed to get word of the day');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeWordOfDay();

    // Set up timer for next word
    const updateNextWordTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      setNextWordTime(formatTimeRemaining(timeUntilMidnight));

      // If it's midnight, fetch new word
      if (timeUntilMidnight <= 0) {
        initializeWordOfDay();
      }
    };

    // Update countdown every second
    const intervalId = setInterval(updateNextWordTime, 1000);

    // Initial update
    updateNextWordTime();

    return () => clearInterval(intervalId);
  }, []);

  return {
    wordOfTheDay,
    nextWordTime,
    isLoading,
    error
  };
};