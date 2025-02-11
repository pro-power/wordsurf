const API_URL = "http://localhost:5000/api/leaderboard";


const leaderboardService = {
  async getTopScores() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  },

  async saveScore(scoreData) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scoreData),
      });
      if (!response.ok) {
        throw new Error("Failed to save score");
      }
      return response.json();
    } catch (error) {
      console.error("Error saving score:", error);
    }
  },
};

export default leaderboardService;
