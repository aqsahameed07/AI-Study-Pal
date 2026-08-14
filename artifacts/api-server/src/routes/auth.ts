import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.js';
import { User } from '../models/User.js';

const router = Router();

// Sync user from Clerk (call after sign-up or sign-in)
router.post('/sync-user', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId, email, firstName, lastName, fullName } = req.user!;
    
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      user = new User({
        clerkId: userId,
        email,
        firstName,
        lastName,
        fullName,
      });
      await user.save();
      console.log(`✅ New user created: ${email}`);
    } else {
      // Update existing user
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      user.fullName = fullName;
      await user.save();
      console.log(`🔄 User updated: ${email}`);
    }
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync user',
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user!.userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
    });
  }
});

// Update user settings
router.put('/settings', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { darkMode, notifications, studyReminders } = req.body;
    
    const user = await User.findOneAndUpdate(
      { clerkId: req.user!.userId },
      { 
        $set: { 
          'settings.darkMode': darkMode,
          'settings.notifications': notifications,
          'settings.studyReminders': studyReminders,
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
    });
  }
});

// Update user stats
router.put('/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { studyTime, quizScore, flashcardCount } = req.body;
    
    const user = await User.findOne({ clerkId: req.user!.userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    if (studyTime) user.stats.totalStudyTime += studyTime;
    if (quizScore !== undefined) {
      user.stats.totalQuizzesTaken += 1;
      const total = user.stats.totalQuizzesTaken;
      const currentAvg = user.stats.averageQuizScore;
      user.stats.averageQuizScore = ((currentAvg * (total - 1)) + quizScore) / total;
    }
    if (flashcardCount) user.stats.totalFlashcardsCreated += flashcardCount;
    
    await user.save();
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stats',
    });
  }
});

export default router;