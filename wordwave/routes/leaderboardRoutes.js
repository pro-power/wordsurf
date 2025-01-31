import express from 'express';
import Leaderboard from './models/Leaderboard.js';  // Adjust if necessary

const router = express.Router();

// GET Leaderboard Data
router.get("/", async (req, res) => {
  try {
    // Fetch data from MongoDB
    const topScores = await Leaderboard.find().sort({ score: -1 }).limit(5);
    
    // Log the data to check if it's fetched correctly
    console.log("Fetched leaderboard data:", topScores);

    // Check if any data is returned
    if (!topScores || topScores.length === 0) {
      return res.status(404).json({ message: "No leaderboard data found." });
    }

    // Send the fetched data to the client
    res.json(topScores);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);  // Log error
    res.status(500).json({ message: "Error fetching leaderboard", error: err });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { name, email, score } = req.body;
    
    console.log("Received data:", { name, email, score }); // Log the data received

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const newLeaderboardEntry = new Leaderboard({ name, email, score });
    const savedEntry = await newLeaderboardEntry.save();

    res.status(201).json(savedEntry);
  } catch (err) {
    console.error("Error adding leaderboard entry:", err);
    res.status(500).json({ message: "Error adding leaderboard entry", error: err });
  }
});


export default router;
