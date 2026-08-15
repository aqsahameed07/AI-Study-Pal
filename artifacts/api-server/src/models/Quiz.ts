import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  userId: string;
  title: string;
  subject?: string;
  questions: Array<{
    question: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    userAnswer?: number;
    isCorrect?: boolean;
  }>;
  settings: {
    timeLimit?: number;
    shuffleQuestions: boolean;
    showAnswers: boolean;
  };
  stats: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    score: number;
    timeSpent: number;
  };
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    userId: { 
      type: String, 
      required: true, 
      index: true 
    },
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    subject: {
      type: String,
      trim: true,
    },
    questions: [{
      question: { 
        type: String, 
        required: true 
      },
      options: [{
        text: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      }],
      explanation: String,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
      },
      userAnswer: Number,
      isCorrect: Boolean,
    }],
    settings: {
      timeLimit: Number,
      shuffleQuestions: { 
        type: Boolean, 
        default: false 
      },
      showAnswers: { 
        type: Boolean, 
        default: true 
      },
    },
    stats: {
      totalQuestions: { 
        type: Number, 
        default: 0 
      },
      correctAnswers: { 
        type: Number, 
        default: 0 
      },
      incorrectAnswers: { 
        type: Number, 
        default: 0 
      },
      score: { 
        type: Number, 
        default: 0 
      },
      timeSpent: { 
        type: Number, 
        default: 0 
      },
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Update stats before saving
QuizSchema.pre('save', function(next: (err?: Error) => void) {
  this.stats.totalQuestions = this.questions.length;
  this.stats.correctAnswers = this.questions.filter(q => q.isCorrect).length;
  this.stats.incorrectAnswers = this.questions.filter(
    q => q.isCorrect === false && q.userAnswer !== undefined
  ).length;
  this.stats.score = this.stats.totalQuestions > 0 
    ? Math.round((this.stats.correctAnswers / this.stats.totalQuestions) * 100)
    : 0;
  
  if (this.stats.correctAnswers + this.stats.incorrectAnswers === this.stats.totalQuestions && this.stats.totalQuestions > 0) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  next();
});

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);