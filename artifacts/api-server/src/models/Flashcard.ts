import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcard extends Document {
  userId: string;
  deckName: string;
  subject?: string;
  cards: Array<{
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    lastReviewed?: Date;
    nextReview?: Date;
    reviewCount: number;
    correctCount: number;
    incorrectCount: number;
  }>;
  stats: {
    totalCards: number;
    masteredCards: number;
    learningCards: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcard>(
  {
    userId: { 
      type: String, 
      required: true, 
      index: true 
    },
    deckName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    subject: {
      type: String,
      trim: true,
    },
    cards: [{
      question: { 
        type: String, 
        required: true 
      },
      answer: { 
        type: String, 
        required: true 
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
      },
      tags: [String],
      lastReviewed: Date,
      nextReview: Date,
      reviewCount: { 
        type: Number, 
        default: 0 
      },
      correctCount: { 
        type: Number, 
        default: 0 
      },
      incorrectCount: { 
        type: Number, 
        default: 0 
      },
    }],
    stats: {
      totalCards: { 
        type: Number, 
        default: 0 
      },
      masteredCards: { 
        type: Number, 
        default: 0 
      },
      learningCards: { 
        type: Number, 
        default: 0 
      },
    },
  },
  {
    timestamps: true,
  }
);

// Update stats before saving
FlashcardSchema.pre('save', function(next) {
  this.stats.totalCards = this.cards.length;
  this.stats.masteredCards = this.cards.filter(
    c => c.reviewCount >= 5 && c.correctCount > c.incorrectCount
  ).length;
  this.stats.learningCards = this.cards.length - this.stats.masteredCards;
  next();
});

export const Flashcard = mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);