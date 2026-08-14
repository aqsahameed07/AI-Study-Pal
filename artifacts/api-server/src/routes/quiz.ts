import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.js';
import { Quiz } from '../models/Quiz.js';

const router = Router();

// Get all quizzes
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
    });
  }
});

// Get a single quiz
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }
    
    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
    });
  }
});

// Create a quiz
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, subject, questions, settings } = req.body;
    
    const quiz = new Quiz({
      userId: req.user!.userId,
      title,
      subject,
      questions: questions.map((q: any) => ({
        ...q,
        userAnswer: undefined,
        isCorrect: undefined,
      })),
      settings: settings || { shuffleQuestions: false, showAnswers: true },
      status: 'not-started',
    });
    
    await quiz.save();
    
    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
    });
  }
});

// Submit quiz answers
router.put('/:id/submit', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { answers, timeSpent } = req.body;
    
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }
    
    if (quiz.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Quiz already completed',
      });
    }
    
    // Update answers
    quiz.questions = quiz.questions.map((q, index) => {
      const answer = answers && answers[index] !== undefined ? answers[index] : q.userAnswer;
      return {
        ...q,
        userAnswer: answer,
        isCorrect: answer !== undefined ? q.options[answer]?.isCorrect || false : false,
      };
    });
    
    if (timeSpent) {
      quiz.stats.timeSpent = timeSpent;
    }
    
    quiz.startedAt = quiz.startedAt || new Date();
    await quiz.save();
    
    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
    });
  }
});

// Delete a quiz
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
    });
  }
});

export default router;