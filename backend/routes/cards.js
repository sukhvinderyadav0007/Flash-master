const express = require('express');
const router = express.Router();

// ============================================
// IN-MEMORY DATA STORE
// ============================================

let cards = [
    {
        id: 1,
        question: 'What is the capital of France?',
        answer: 'Paris',
        category: 'Geography',
        difficulty: 'Easy',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        question: 'What is 2 + 2?',
        answer: '4',
        category: 'Math',
        difficulty: 'Easy',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 3,
        question: 'What is the largest planet?',
        answer: 'Jupiter',
        category: 'Science',
        difficulty: 'Medium',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 4,
        question: 'Who wrote Romeo and Juliet?',
        answer: 'William Shakespeare',
        category: 'Literature',
        difficulty: 'Medium',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 5,
        question: 'What is the chemical symbol for Gold?',
        answer: 'Au',
        category: 'Chemistry',
        difficulty: 'Hard',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

let nextId = 6;

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

const validateCardData = (req, res, next) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({
            error: 'Question and answer are required',
            received: { question, answer }
        });
    }

    if (typeof question !== 'string' || typeof answer !== 'string') {
        return res.status(400).json({
            error: 'Question and answer must be strings'
        });
    }

    if (question.trim().length === 0 || answer.trim().length === 0) {
        return res.status(400).json({
            error: 'Question and answer cannot be empty'
        });
    }

    next();
};

// ============================================
// ROUTES
// ============================================

// GET all cards with optional filters
router.get('/', (req, res) => {
    try {
        const { category, difficulty, search } = req.query;
        let filtered = cards;

        if (category) {
            filtered = filtered.filter(c => c.category === category);
        }

        if (difficulty) {
            filtered = filtered.filter(c => c.difficulty === difficulty);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(c =>
                c.question.toLowerCase().includes(searchLower) ||
                c.answer.toLowerCase().includes(searchLower)
            );
        }

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET a single card by ID
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Invalid card ID'
            });
        }

        const card = cards.find(c => c.id === id);

        if (!card) {
            return res.status(404).json({
                error: 'Card not found',
                id: id
            });
        }

        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST a new card
router.post('/', validateCardData, (req, res) => {
    try {
        const { question, answer, category = 'General', difficulty = 'Medium' } = req.body;

        const newCard = {
            id: nextId++,
            question: question.trim(),
            answer: answer.trim(),
            category: category || 'General',
            difficulty: difficulty || 'Medium',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Validate difficulty
        const validDifficulties = ['Easy', 'Medium', 'Hard'];
        if (!validDifficulties.includes(newCard.difficulty)) {
            return res.status(400).json({
                error: 'Invalid difficulty. Must be one of: Easy, Medium, Hard'
            });
        }

        cards.push(newCard);

        res.status(201).json(newCard);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update a card
router.put('/:id', validateCardData, (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Invalid card ID'
            });
        }

        const card = cards.find(c => c.id === id);

        if (!card) {
            return res.status(404).json({
                error: 'Card not found',
                id: id
            });
        }

        const { question, answer, category, difficulty } = req.body;

        // Validate difficulty if provided
        if (difficulty) {
            const validDifficulties = ['Easy', 'Medium', 'Hard'];
            if (!validDifficulties.includes(difficulty)) {
                return res.status(400).json({
                    error: 'Invalid difficulty. Must be one of: Easy, Medium, Hard'
                });
            }
        }

        card.question = question.trim();
        card.answer = answer.trim();
        if (category) card.category = category;
        if (difficulty) card.difficulty = difficulty;
        card.updatedAt = new Date();

        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE a card
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Invalid card ID'
            });
        }

        const index = cards.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({
                error: 'Card not found',
                id: id
            });
        }

        const deletedCard = cards.splice(index, 1);
        res.json(deletedCard[0]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE all cards (dangerous - use with caution)
router.delete('/', (req, res) => {
    try {
        const count = cards.length;
        cards = [];
        res.json({
            message: `Deleted ${count} cards`,
            deletedCount: count
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET statistics
router.get('/stats/overview', (req, res) => {
    try {
        const categories = [...new Set(cards.map(c => c.category))];
        const difficulties = [...new Set(cards.map(c => c.difficulty))];

        const stats = {
            totalCards: cards.length,
            categories: categories,
            difficulties: difficulties,
            byCategory: {},
            byDifficulty: {}
        };

        categories.forEach(cat => {
            stats.byCategory[cat] = cards.filter(c => c.category === cat).length;
        });

        difficulties.forEach(diff => {
            stats.byDifficulty[diff] = cards.filter(c => c.difficulty === diff).length;
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
