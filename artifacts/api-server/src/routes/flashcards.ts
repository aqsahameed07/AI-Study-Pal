import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.js';
import { Flashcard } from '../models/Flashcard.js';

const router = Router();

// Get all flashcard decks
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const decks = await Flashcard.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: decks,
    });
  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flashcards',
    });
  }
});

// Get a single deck
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const deck = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found',
      });
    }
    
    res.json({
      success: true,
      data: deck,
    });
  } catch (error) {
    console.error('Get flashcard deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flashcard deck',
    });
  }
});

// Create a flashcard deck
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { deckName, subject, cards } = req.body;
    
    const deck = new Flashcard({
      userId: req.user!.userId,
      deckName,
      subject,
      cards: cards.map((card: any) => ({
        ...card,
        lastReviewed: new Date(),
        nextReview: new Date(),
      })),
    });
    
    await deck.save();
    
    res.status(201).json({
      success: true,
      data: deck,
    });
  } catch (error) {
    console.error('Create flashcard deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create flashcard deck',
    });
  }
});

// Review a card
router.put('/:deckId/review/:cardIndex', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { deckId, cardIndex } = req.params;
    const { correct } = req.body;
    
    const deck = await Flashcard.findOne({
      _id: deckId,
      userId: req.user!.userId,
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found',
      });
    }
    
    const index = parseInt(cardIndex);
    if (index < 0 || index >= deck.cards.length) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }
    
    const card = deck.cards[index];
    card.lastReviewed = new Date();
    card.reviewCount += 1;
    card.correctCount += correct ? 1 : 0;
    card.incorrectCount += correct ? 0 : 1;
    
    // Spaced repetition intervals (in days)
    if (correct) {
      const intervals = [1, 3, 7, 14, 30];
      const intervalIndex = Math.min(card.reviewCount, intervals.length - 1);
      const days = intervals[intervalIndex];
      card.nextReview = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    } else {
      // Review again tomorrow if incorrect
      card.nextReview = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    }
    
    await deck.save();
    
    res.json({
      success: true,
      data: deck,
    });
  } catch (error) {
    console.error('Review card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review card',
    });
  }
});

// Delete a deck
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const deck = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Flashcard deck deleted successfully',
    });
  } catch (error) {
    console.error('Delete flashcard deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete flashcard deck',
    });
  }
});

export default router;