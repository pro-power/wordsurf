const WORD_POOL = [
    'chain', 'start', 'plant', 'table', 'house', 'light', 'music', 
    'brain', 'dance', 'world', 'smile', 'green', 'bread', 'phone'
  ];
  
  export const fetchWordOfTheDay = async () => {
    console.log('fetchWordOfTheDay: function called');
    try {
      console.log('Attempting to fetch from API: https://random-word.ryanrk.com/api/en/word/random/?minlength=4&maxlength=8');
      const response = await fetch('https://random-word.ryanrk.com/api/en/word/random/?minlength=4&maxlength=8');
      console.log('API response:', response);
      const data = await response.json();
      console.log("data fetched Json: ", data);
      
      return data[0].toLowerCase();
    } catch (error) {
      console.error('Failed to fetch word of the day:', error);
      // Fallback to local word pool using date as seed
      const today = new Date().toISOString().split('T')[0];
      console.log("Today's date: ", today);
      const hash = today.split('')
        .reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0);
      return WORD_POOL[Math.abs(hash) % WORD_POOL.length];
    }
  };
  
  export const getStoredWordData = () => {
    console.log('Retrieved from localStorage:', localStorage.getItem('word') );
    return {
      word: localStorage.getItem('wordOfTheDay'),
      date: localStorage.getItem('wordOfDayDate')
      
    };
  };
  
  export const storeWordData = (word) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('wordOfTheDay', word);
    localStorage.setItem('wordOfDayDate', today);
    console.log("Retrived word from local:", word);
  };