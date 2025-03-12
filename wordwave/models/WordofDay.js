import mongoose from 'mongoose';

const wordOfDaySchema = new mongoose.Schema({
  word: { 
    type: String, 
    required: true 
  },
  bonusWord: { 
    type: String, 
    required: true 
  },
  definition: { 
    type: String, 
    default: '' 
  },
  date: { 
    type: String, 
    required: true,
    unique: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const WordOfDay = mongoose.model('Words', wordOfDaySchema);

export default WordOfDay;