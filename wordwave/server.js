import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Leaderboard from "./models/Leaderboard.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));


// API Route to Get Top 5 Scores
app.get("/api/leaderboard", async (req, res) => {
  try {
    const topScores = await Leaderboard.find().sort({ score: -1 }).limit(5);
    res.json(topScores);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

// API Route to Submit a Score
app.post("/api/leaderboard", async (req, res) => {
  try {
    console.log('!!!!!!!', req.body);
    const { name, email, score } = req.body;
    const newScore = new Leaderboard({ name, email, score });
    await newScore.save();
    res.status(201).json({ message: "Score saved successfully" });
  } catch (err) {
    console.error('Could not save score', err);
    res.status(500).json({ message: "Error saving score" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
