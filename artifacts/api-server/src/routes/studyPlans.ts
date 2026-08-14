import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.js';
import { StudyPlan } from '../models/StudyPlan.js';

const router = Router();

// Get all study plans
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Get study plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch study plans',
    });
  }
});

// Get a single study plan
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found',
      });
    }
    
    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Get study plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch study plan',
    });
  }
});

// Create a study plan
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, subject, description, goals, tasks, schedule } = req.body;
    
    const plan = new StudyPlan({
      userId: req.user!.userId,
      title,
      subject,
      description,
      goals: goals || [],
      tasks: tasks || [],
      schedule: schedule || {},
    });
    
    await plan.save();
    
    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Create study plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create study plan',
    });
  }
});

// Update a study plan
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, subject, description, goals, tasks, schedule } = req.body;
    
    const plan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { 
        title, 
        subject, 
        description, 
        goals, 
        tasks, 
        schedule 
      },
      { new: true, runValidators: true }
    );
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found',
      });
    }
    
    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Update study plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update study plan',
    });
  }
});

// Delete a study plan
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Study plan deleted successfully',
    });
  } catch (error) {
    console.error('Delete study plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete study plan',
    });
  }
});

export default router;