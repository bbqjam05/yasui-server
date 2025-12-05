const express = require('express');
const router = express.Router();
const Word = require('../models/word');

/**
 * @route   POST /api/quiz/generate
 * @desc    Generate a quiz with random words based on level and count
 * @access  Public
 * 
 * @body    { "level": "N1", "count": 10 }
 */
router.post('/generate', async (req, res) => {
  try {
    const { level, count } = req.body;

    // Validate input
    if (!level || !count) {
      return res.status(400).json({ msg: 'Please provide both level and count.' });
    }

    const wordCount = parseInt(count, 10);
    if (isNaN(wordCount) || wordCount <= 0) {
        return res.status(400).json({ msg: 'Count must be a positive number.' });
    }

    // Build the match query
    const matchQuery = { level: level };

    // Fetch random words from the database using aggregation
    // $match: Filters documents by the specified criteria
    // $sample: Randomly selects the specified number of documents
    const words = await Word.aggregate([
      { $match: matchQuery },
      { $sample: { size: wordCount } }
    ]);

    if (words.length < wordCount) {
        console.warn(`Could not find enough words for level ${level}. Found ${words.length}, requested ${wordCount}.`);
    }
    
    if (words.length === 0) {
        return res.status(404).json({ msg: `No words found for the specified criteria.` });
    }

    // For the quiz, we only send the necessary fields to the client
    const quizQuestions = words.map(word => ({
        _id: word._id,
        word: word.word,
        // The frontend will ask the user for the 'reading' or 'meaning'
    }));

    res.json(quizQuestions);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/quiz/validate
 * @desc    Validate user's answers for a quiz
 * @access  Public
 * 
 * @body    [{ "wordId": "...", "userAnswer": "..." }]
 */
router.post('/validate', async (req, res) => {
    try {
        const { quizType, answers } = req.body;

        if (!quizType || !['pronunciation', 'meaning'].includes(quizType)) {
            return res.status(400).json({ msg: "Please provide a valid quizType ('pronunciation' or 'meaning')." });
        }

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ msg: 'Please provide an array of answers.' });
        }

        const wordIds = answers.map(answer => answer.wordId);
        const correctWords = await Word.find({ '_id': { $in: wordIds } });
        const correctWordMap = new Map(correctWords.map(word => [word._id.toString(), word]));

        const results = answers.map(answer => {
            const correctWord = correctWordMap.get(answer.wordId);
            let isCorrect = false;

            if (correctWord) {
                if (quizType === 'pronunciation') {
                    isCorrect = answer.userAnswer.trim() === correctWord.hangeul;
                } else if (quizType === 'meaning') {
                    const possibleAnswers = correctWord.meaning.split(',').map(m => m.trim());
                    isCorrect = possibleAnswers.includes(answer.userAnswer.trim());
                }
            }
            
            return {
                wordId: answer.wordId,
                userAnswer: answer.userAnswer,
                isCorrect: isCorrect,
                correctAnswer: {
                    word: correctWord ? correctWord.word : 'N/A',
                    reading: correctWord ? correctWord.reading : 'N/A',
                    meaning: correctWord ? correctWord.meaning : 'N/A',
                    hangeul: correctWord ? correctWord.hangeul : 'N/A',
                    partOfSpeech: correctWord ? correctWord.partOfSpeech : 'N/A'
                }
            };
        });

        res.json(results);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
