const mongoose = require('mongoose');

/**
 * Japanese Vocabulary Word Schema
 * Based on the requirements from the "YasuiPractice" project plan.
 */
const WordSchema = new mongoose.Schema({
  // 단어 (例: 日本)
  word: {
    type: String,
    required: [true, 'Word is required.'],
    unique: true,
    trim: true
  },
  // 읽기 (例: にほん)
  reading: {
    type: String,
    required: [true, 'Reading is required.'],
    trim: true
  },
  // 뜻 (例: 일본)
  meaning: {
    type: String,
    required: [true, 'Meaning is required.'],
    trim: true
  },
  // 한글 발음 (예: '기쥬츠')
  hangeul: {
    type: String,
    required: true
  },
  // 급수 (JLPT Level, 例: N1, N2)
  level: {
    type: String,
    required: [true, 'JLPT level is required.'],
    enum: ['N1', 'N2', 'N3', 'N4', 'N5']
  },
  partOfSpeech: {
    type: String,
    required: true,
    enum: ['noun', 'verb', 'adjective', 'adverb']
  }
}, {
  // Automatically add 'createdAt' and 'updatedAt' fields
  timestamps: true
});

const Word = mongoose.model('Word', WordSchema);

module.exports = Word;
