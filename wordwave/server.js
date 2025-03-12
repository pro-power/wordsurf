import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Leaderboard from "./models/Leaderboard.js";
import wordRoutes from "./routes/wordRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS properly
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Add your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if cannot connect to database
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// API Routes
app.use("/api/words", wordRoutes);

// Leaderboard routes
app.get("/api/leaderboard", async (req, res) => {
  try {
    const topScores = await Leaderboard.find().sort({ score: -1 }).limit(5);
    res.json(topScores);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

app.post("/api/leaderboard", async (req, res) => {
  try {
    const { name, email, score } = req.body;
    const newScore = new Leaderboard({ name, email, score });
    await newScore.save();
    res.status(201).json({ message: "Score saved successfully" });
  } catch (err) {
    console.error('Could not save score:', err);
    res.status(500).json({ message: "Error saving score" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: "An unexpected error occurred", 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});