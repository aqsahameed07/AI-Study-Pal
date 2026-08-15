import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.js';
import { User } from '../models/User.js';

const router = Router();

// Sync user from Clerk (call after sign-up or sign-in)
router.post('/sync-user', authMiddleware, async (req: AuthRequest, res) => {
  try {
    console.log('========================================');
    console.log('📥 POST /auth/sync-user hit');
    console.log('Headers Authorization present?', !!req.headers.authorization);
    console.log('req.user from middleware:', req.user);

    const { userId, email, firstName, lastName, fullName, phoneNumber } = req.user!;

    console.log('Extracted data:');
    console.log('  userId     :', userId);
    console.log('  email      :', email);
    console.log('  firstName  :', firstName);
    console.log('  lastName   :', lastName);
    console.log('  fullName   :', fullName);
    console.log('  phoneNumber:', phoneNumber);

    let user = await User.findOne({ clerkId: userId });
    console.log('Existing user in DB?', user ? 'YES' : 'NO');

    if (!user) {
      user = new User({
        clerkId: userId,
        email,
        firstName,
        lastName,
        fullName,
        phoneNumber,
      });
      await user.save();
      console.log('✅ New user created:', email);
      console.log('Saved document:', user);
    } else {
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      user.fullName = fullName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      await user.save();
      console.log('🔄 User updated:', email);
      console.log('Updated document:', user);
    }

    console.log('========================================');

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('❌ Sync user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync user',
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    console.log('📥 GET /auth/me hit for userId:', req.user?.userId);

    const user = await User.findOne({ clerkId: req.user!.userId });

    if (!user) {
      console.log('⚠️ User not found in DB');
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('✅ Returning user:', user.email);
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
    console.log('📥 PUT /auth/settings body:', req.body);

    const user = await User.findOneAndUpdate(
      { clerkId: req.user!.userId },
      {
        $set: {
          'settings.darkMode': darkMode,
          'settings.notifications': notifications,
          'settings.studyReminders': studyReminders,
        },
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
    console.log('📥 PUT /auth/stats body:', req.body);

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
      user.stats.averageQuizScore = (currentAvg * (total - 1) + quizScore) / total;
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